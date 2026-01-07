import axios from 'axios';
import jwtUtil from "../utils/jwt/jwt.util.js";
import usersRepository from "../repositories/users.repository.js";
import engineersRepository from "../repositories/engineers.repository.js";
import reservationsRepository from "../repositories/reservations.repository.js";
import db from '../models/index.js';

/**
* @description 신규 엔지니어 생성 및 로그인 처리
*/
const createAndLoginEngineer = async (socialId, provider, name, phoneNumber, email) => {
  const existingUser = await usersRepository.findUserByEmail(email);
  if (existingUser) {
    throw new Error("이미 존재하는 이메일입니다.");
  }

  return await db.sequelize.transaction(async t => {
    const newUser = await usersRepository.createUser(t, {
      socialId, provider, name, phoneNumber, email, role: "engineer",
    });
  
    await engineersRepository.createEngineer(t, { userId: newUser.id });
  
    // Token 생성
    const accessToken = jwtUtil.generateAccessToken(newUser);
    const refreshToken = jwtUtil.generateRefreshToken(newUser);
  
    // RefreshToken 저장
    newUser.refreshToken = refreshToken;
    await usersRepository.save(newUser, t);
  
    return {
      user: newUser,
      accessToken,
      refreshToken,
    }; // user, accessToken, refreshToken 반환
  });
};

const getDashboard = async (userId) => {
  // 1. 유저 확인
  const user = await usersRepository.findUserById(userId);
  if (!user || user.role !== "engineer") {
    throw new Error("NOT_ENGINEER");
  }

  // 2. Engineer 테이블 조회
  const engineer =
    await engineersRepository.findEngineerByUserId(userId);

  if (!engineer || !engineer.isActive) {
    throw new Error("ENGINEER_INACTIVE");
  }

  // 3. 날짜 계산
  const today = new Date();
  const yyyyMmDd = today.toISOString().slice(0, 10);

  const startOfMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );
  const endOfMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  );

  // 4. 예약 건수 조회 (Engineer.id 기준)
  const todayCount =
    await reservationsRepository.countByEngineerPkAndDate(
      engineer.id,
      yyyyMmDd
    );

  const monthCount =
    await reservationsRepository.countByEngineerPkAndMonth(
      engineer.id,
      startOfMonth,
      endOfMonth
    );

  // 5. 응답
  return {
    engineer: {
      name: user.name,
      grade: engineer.skillLevel,
    },
    today: yyyyMmDd,
    todayReservationCount: todayCount,
    monthlyReservationCount: monthCount,
  };
};

const getDailyReservations = async (userId, date) => {
  const engineer = await engineersRepository.findEngineerByUserId(userId);

  if (!engineer) {
    throw new Error("ENGINEER_NOT_FOUND");
  }

  if (!engineer.isActive) {
    throw new Error("ENGINEER_INACTIVE");
  }

  const reservations =
    await reservationsRepository.findByEngineerAndDate(
      engineer.id,
      date
    );

  return reservations.map((r) => ({
    reservationId: r.id,
    time: `${r.serviceStartTime}~${r.serviceEndTime}`,

    // Business 기준
    managerName: r.Business?.managerName ?? null,
    businessName: r.Business?.name ?? null,
    businessAddress: r.Business
      ? `${r.Business.mainAddress} ${r.Business.detailedAddress ?? ""}`
      : null,

    // ServicePolicy 기준
    serviceType: r.ServicePolicy?.serviceType ?? null,

    status: r.status,
  }));
};

const getReservationDetail = async (userId, reservationId) => {
  // 1. Engineer 확인
  const engineer =
    await engineersRepository.findEngineerByUserId(userId);

  if (!engineer || !engineer.isActive) {
    throw new Error("ENGINEER_INACTIVE");
  }

  // 2. 예약 조회 (기사 소유 검증 포함)
  const reservation =
    await reservationsRepository.findDetailByIdAndEngineer(
      reservationId,
      engineer.id
    );

  if (!reservation) {
    throw new Error("RESERVATION_NOT_FOUND");
  }

  // 3. 응답 매핑
  return {
    reservationId: reservation.id,
    date: reservation.reservedDate,
    time: {
      start: reservation.serviceStartTime,
      end: reservation.serviceEndTime,
    },
    status: reservation.status,
    business: {
      name: reservation.Business.name,
      managerName: reservation.Business.managerName,
      phoneNumber: reservation.Business.phoneNumber,
      address:
        reservation.Business.mainAddress +
        " " +
        (reservation.Business.detailedAddress || ""),
    },
    service: {
      type: reservation.ServicePolicy.serviceType,
      duration: reservation.ServicePolicy.standardDuration,
    },
    iceMachine: reservation.IceMachine
      ? {
          modelName: reservation.IceMachine.modelName,
          sizeType: reservation.IceMachine.sizeType,
          modelPic: reservation.IceMachine.modelPic,
        }
      : null,
  };
};

// 예약 status 공통 검증 함수
const validateEngineerReservation = async (
  userId,
  reservationId
) => {
  const engineer =
    await engineersRepository.findEngineerByUserId(userId);

  if (!engineer || !engineer.isActive) {
    throw new Error("ENGINEER_INACTIVE");
  }

  const reservation =
    await reservationsRepository.findReservationById(
      reservationId
    );

  if (
    !reservation ||
    reservation.engineerId !== engineer.id
  ) {
    throw new Error("FORBIDDEN_RESERVATION");
  }

  return reservation;
};

// 작업 시작
const startWork = async (userId, reservationId) => {
  const reservation =
    await validateEngineerReservation(
      userId,
      reservationId
    );

  if (reservation.status !== "CONFIRMED") {
    throw new Error("INVALID_STATUS");
  }

  await reservationsRepository.updateReservation(
    reservationId,
    { status: "START" }
  );
};

// 작업 완료
const completeWork = async (userId, reservationId) => {
  const reservation =
    await validateEngineerReservation(
      userId,
      reservationId
    );

  if (reservation.status !== "START") {
    throw new Error("INVALID_STATUS");
  }

  await reservationsRepository.updateReservation(
    reservationId,
    { status: "COMPLETED" }
  );
};

// 작업 취소
const cancelWork = async (
  userId,
  reservationId,
  reason
) => {
  const reservation =
    await validateEngineerReservation(
      userId,
      reservationId
    );

  if (reservation.status === "COMPLETED") {
    throw new Error("CANNOT_CANCEL_COMPLETED");
  }

  await reservationsRepository.updateReservation(
    reservationId,
    {
      status: "CANCELED",
      cancelReason: reason,
    }
  );
};

const getMonthlyCalendar = async (userId, year, month) => {
  // 1. 엔지니어 확인
  const engineer =
    await engineersRepository.findEngineerByUserId(userId);

  if (!engineer || !engineer.isActive) {
    throw new Error("ENGINEER_INACTIVE");
  }

  // 2. 월 시작 / 끝 계산
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  // 3. 예약 조회 (월 단위)
  const reservations =
    await reservationsRepository.findByEngineerAndMonth(
      engineer.id,
      startDate,
      endDate
    );

  // 4. 날짜별 집계
  const days = {};

  reservations.forEach((r) => {
    const date = r.reservedDate;
    days[date] = (days[date] || 0) + 1;
  });

  return {
    year,
    month,
    days,
  };
};


export default {
  createAndLoginEngineer,
  getDashboard,
  getDailyReservations,
  getReservationDetail,
  validateEngineerReservation,
  startWork,
  completeWork,
  cancelWork,
  getMonthlyCalendar,
};