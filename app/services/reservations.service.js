/**
 * @file app/services/reservations.service.js
 * @description 예약 관련 서비스
 * 251231 v1.0.0 You init
 */
import db from "../models/index.js";
import reservationsRepository from "../repositories/reservations.repository.js";
import engineersRepository from "../repositories/engineers.repository.js";
import myError from "../errors/customs/my.error.js";
import {
  CONFLICT_ERROR,
  BAD_REQUEST_ERROR,
  NOT_FOUND_ERROR,
} from "../../configs/responseCode.config.js";
import dayjs from "dayjs";

// const { sequelize } = db;

// --- 예약 가능 여부 조회 (Availability Check) ---

const { sequelize, ServicePolicy } = db;

// --- 예약 가능 여부 조회 (Availability Check) ---

/**
 * 특정 기간 내 예약 불가능한 시간 슬롯 목록 조회 (JS 로직)
 * @param {string} startDate
 * @param {string} endDate
 * @param {string} servicePolicyId
 */
async function getDisabledSlots(startDate, endDate, servicePolicyId) {
  // 1. 유효성 검증
  if (!startDate || !endDate || !servicePolicyId) {
    throw new myError(
      "startDate, endDate, servicePolicyId는 필수 파라미터입니다.",
      BAD_REQUEST_ERROR
    );
  }
  if (dayjs(endDate).isAfter(dayjs(startDate).add(2, "month"))) {
    throw new myError(
      "조회 범위는 최대 2개월까지 가능합니다.",
      BAD_REQUEST_ERROR
    );
  }

  // 2. 필요 데이터 미리 조회
  const servicePolicy = await ServicePolicy.findByPk(servicePolicyId);
  if (!servicePolicy) {
    throw new myError("서비스 정책을 찾을 수 없습니다.", NOT_FOUND_ERROR);
  }
  const serviceDuration = servicePolicy.standardDuration; // 분 단위

  const reservations = await reservationsRepository.findReservationsByDateRange(
    startDate,
    endDate
  );
  const engineersWithShifts =
    await engineersRepository.findActiveEngineersWithShifts();

  // 3. 비즈니스 로직 처리
  const disabledSlots = [];
  const timeSlots = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  let currentDate = dayjs(startDate);
  const lastDate = dayjs(endDate);

  while (currentDate.isBefore(lastDate) || currentDate.isSame(lastDate)) {
    const dayOfWeek = currentDate.day(); // 0=일, 1=월, ..., 6=토

    for (const time of timeSlots) {
      const slotStart = dayjs(`${currentDate.format("YYYY-MM-DD")} ${time}`);
      const slotEnd = slotStart.add(serviceDuration, "minute");

      // 엔지니어 수 계산
      const availableEngineers = engineersWithShifts.filter((eng) => {
        return eng.EngineerShifts.some((shift) => {
          const shiftStart = dayjs(
            `${currentDate.format("YYYY-MM-DD")} ${shift.shiftStart}`
          );
          const shiftEnd = dayjs(
            `${currentDate.format("YYYY-MM-DD")} ${shift.shiftEnd}`
          );
          return (
            shift.availableDate === dayOfWeek &&
            (slotStart.isAfter(shiftStart) || slotStart.isSame(shiftStart)) &&
            (slotEnd.isBefore(shiftEnd) || slotEnd.isSame(shiftEnd))
          );
        });
      });
      const engineerCount = availableEngineers.length;

      // 예약 수 계산
      const reservationCount = reservations.filter((res) => {
        const resStart = dayjs(res.serviceStartTime);
        const resEnd = dayjs(res.serviceEndTime);
        // 겹치는지 확인: (resStart < slotEnd) AND (resEnd > slotStart)
        return resStart.isBefore(slotEnd) && resEnd.isAfter(slotStart);
      }).length;

      // 비활성화 조건 확인
      if (engineerCount <= reservationCount) {
        disabledSlots.push({
          date: currentDate.format("YYYY-MM-DD"),
          time: time,
          reason:
            engineerCount === 0 ? "NO_ENGINEER_AVAILABLE" : "FULLY_BOOKED",
        });
      }
    }
    currentDate = currentDate.add(1, "day");
  }

  // 4. 결과 반환
  return {
    range: { start: startDate, end: endDate },
    disabled: disabledSlots,
  };
}

// --- 예약 생성 및 자동 배정 ---

const findAvailableEngineerQuery = `
  SELECT
    e.user_id AS engineer_id
  FROM
    reservations AS target
  CROSS JOIN
    engineers AS e
  JOIN
    engineer_shifts AS es ON es.engineer_id = e.user_id
  WHERE
    target.id = :reservationId
    AND e.is_active = 1
    AND es.available_date = (DAYOFWEEK(target.reserved_date) - 1)
    AND es.shift_start <= TIME(target.service_start_time)
    AND es.shift_end >= TIME(target.service_end_time)
  ORDER BY
    RAND()
  LIMIT 1;
`;

/**
 * 예약 생성 및 기사 자동 배정
 * @param {number} userId
 * @param {object} reservationDto
 */
async function createAndAssignReservation(userId, reservationDto) {
  const t = await sequelize.transaction();

  try {
    const pendingReservation = await reservationsRepository.createReservation(
      {
        ...reservationDto,
        userId,
        status: "PENDING",
        engineerId: null,
      },
      t
    );

    const availableEngineers = await sequelize.query(
      findAvailableEngineerQuery,
      {
        replacements: { reservationId: pendingReservation.id },
        transaction: t,
        plain: false,
        raw: true,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const availableEngineer = availableEngineers[0];

    if (!availableEngineer) {
      throw new myError("배정 가능한 기사가 없습니다.", CONFLICT_ERROR);
    }

    await reservationsRepository.updateReservation(
      pendingReservation.id,
      {
        engineerId: availableEngineer.engineer_id,
        status: "CONFIRMED",
      },
      t
    );

    await t.commit();

    return await reservationsRepository.findReservationById(
      pendingReservation.id
    );
  } catch (error) {
    await t.rollback();
    // myError가 아닌 다른 에러일 경우를 대비
    if (!(error instanceof myError)) {
      console.error(error); // 디버깅을 위해 실제 에러를 콘솔에 출력
      throw new Error("예약 생성 및 배정 중 오류가 발생했습니다.");
    }
    throw error;
  }
}

export default {
  getDisabledSlots,
  createAndAssignReservation,
};
