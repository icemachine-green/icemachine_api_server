import jwtUtil from "../utils/jwt/jwt.util.js";
import usersRepository from "../repositories/users.repository.js";
import engineersRepository from "../repositories/engineers.repository.js";
import reservationsRepository from "../repositories/reservations.repository.js";
import db from '../models/index.js';
import myError from "../errors/customs/my.error.js";
import { DATA_ABNORMALITY_ERROR } from "../../configs/responseCode.config.js";

/**
* @description 신규 엔지니어 생성 및 로그인 처리
*/
const createAndLoginEngineer = async (socialId, provider, name, phoneNumber, email) => {
  const existingUser = await usersRepository.findUserByEmail(email);
  if (existingUser) {
    throw new Error("이미 존재하는 이메일입니다.");
  }

  return await db.sequelize.transaction(async t => {
    // 1. User 생성
    const newUser = await usersRepository.createUser(t, {
      socialId, provider, name, phoneNumber, email, role: "engineer",
    });

    // 2. Engineer 생성
    const engineer = await engineersRepository.createEngineer(t, { userId: newUser.id });

    // 3. 기본 근무시간 생성 (여기!)
    await engineersRepository.createDefaultShifts(t, engineer.id);
  
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

const getDailyReservations = async ({ userId, date, limit, offset }) => {
  const engineer = await engineersRepository.findEngineerByUserId(userId);

  if (!engineer) {
    throw myError("ENGINEER_NOT_FOUND", DATA_ABNORMALITY_ERROR);
  }

  if (!engineer.isActive) {
    throw myError("ENGINEER_INACTIVE", DATA_ABNORMALITY_ERROR);
  }

  const result =
    await reservationsRepository.findByEngineerAndDate({
      engineerId: engineer.id,
      date,
      limit,
      offset,
    });

  const today = new Date();
  const yyyyMmDd = today.toISOString().slice(0, 10);
  const isToday = date === yyyyMmDd;

  const rowsWithCanStart = await Promise.all(
    result.rows.map(async (r) => {
      const hasPrevUnfinished =
        await reservationsRepository.existsPreviousUnfinishedReservation({
          engineerId: engineer.id,
          reservedDate: r.reservedDate,
          serviceStartTime: r.serviceStartTime,
        });

      return {
        ...r.toJSON(),
        canStart: !hasPrevUnfinished && isToday,
      };
    })
  );

  return {
    count: result.count,
    rows: rowsWithCanStart,
  };
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

  // 3. 앞타임 예약 중 종료(완료|취소)되지 않은 건이 있는지 확인
  const hasPrevUnfinished =
    await reservationsRepository.existsPreviousUnfinishedReservation({
      engineerId: engineer.id,
      reservedDate: reservation.reservedDate,
      serviceStartTime: reservation.serviceStartTime,
    });

  // 오늘 날짜인지 확인
  const today = new Date();
  const yyyyMmDd = today.toISOString().slice(0, 10);
  const isToday = reservation.reservedDate === yyyyMmDd;

  // 4. 응답 매핑
  return {
    reservationId: reservation.id,
    date: reservation.reservedDate,
    time: {
      start: reservation.serviceStartTime,
      end: reservation.serviceEndTime,
    },
    status: reservation.status,
    canStart: !hasPrevUnfinished && isToday,
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

  const hasPrevUnfinished =
    await reservationsRepository.existsPreviousUnfinishedReservation({
      engineerId: reservation.engineerId,
      reservedDate: reservation.reservedDate,
      serviceStartTime: reservation.serviceStartTime,
    });

  if (hasPrevUnfinished) {
    throw new Error("PREVIOUS_WORK_NOT_COMPLETED");
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

  const totalCount = reservations.length;

  reservations.forEach((r) => {
    const date = r.reservedDate;
    days[date] = (days[date] || 0) + 1;
  });

  return {
    year,
    month,
    totalCount,
    days,
  };
};

const getEngineerMyPage = async (userId, { page = 1, limit = 5 }) => {
  // 1. engineer + user
  const engineer =
    await engineersRepository.findEngineerWithUserByUserId(userId);

  if (!engineer) {
    throw new Error("ENGINEER_NOT_FOUND");
  }

  const engineerId = engineer.id;

  // 2. counts
  const todayCount =
    await reservationsRepository.countTodayWorksByEngineerId(engineerId);

  const totalCount =
    await reservationsRepository.countTotalWorksByEngineerId(engineerId);

  // 3. completed works
  const offset = (page - 1) * limit;

  const { count, rows: completedReservations } =
    await reservationsRepository.findCompletedWorksByEngineerId(engineerId, {limit, offset });

  return {
    engineer: {
      name: engineer.User.name,
      email: engineer.User.email,
      phoneNumber: engineer.User.phoneNumber,
      skillLevel: engineer.skillLevel,
    },
    workSummary: {
      todayCount,
      totalCount,
    },
    completedWorks: completedReservations.map((r) => ({
      reservationId: r.id,
      reservedDate: r.reservedDate,
      businessManagerName: r.Business?.managerName ?? null,
    })),
    pagination: {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    }
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
  getEngineerMyPage,
};