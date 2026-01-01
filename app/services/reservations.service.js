/**
 * @file app/services/reservations.service.js
 * @description 예약 관련 서비스 (기사 기준 availability)
 * 260101 v1.0.1 Taeho-debug
 */

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter.js";

import db from "../models/index.js";
import reservationsRepository from "../repositories/reservations.repository.js";
import engineersRepository from "../repositories/engineers.repository.js";
import myError from "../errors/customs/my.error.js";
import {
  BAD_REQUEST_ERROR,
  NOT_FOUND_ERROR,
  CONFLICT_ERROR,
} from "../../configs/responseCode.config.js";

const { sequelize, ServicePolicy, Business, IceMachine } = db;

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

/* ===============================
   예약 불가능 슬롯 조회 (기사 기준)
================================ */
async function getDisabledSlots(startDate, endDate, servicePolicyId) {
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

  const servicePolicy = await ServicePolicy.findByPk(servicePolicyId);
  if (!servicePolicy) {
    throw new myError("서비스 정책을 찾을 수 없습니다.", NOT_FOUND_ERROR);
  }

  const serviceDuration = servicePolicy.standardDuration;

  const reservations = await reservationsRepository.findReservationsByDateRange(
    startDate,
    endDate
  );

  const engineersWithShifts =
    await engineersRepository.findActiveEngineersWithShifts();

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

  const disabledSlots = [];
  let currentDate = dayjs(startDate);
  const lastDate = dayjs(endDate);

  while (currentDate.isSameOrBefore(lastDate)) {
    const dayOfWeek = currentDate.day();

    for (const time of timeSlots) {
      const slotStart = dayjs(`${currentDate.format("YYYY-MM-DD")} ${time}`);
      const slotEnd = slotStart.add(serviceDuration, "minute");

      // 실제 예약 가능한 기사 존재 여부 체크
      const availableEngineers = engineersWithShifts.filter((eng) =>
        eng.EngineerShifts.some((shift) => {
          const shiftStart = dayjs(
            `${currentDate.format("YYYY-MM-DD")} ${shift.shiftStart}`
          );
          const shiftEnd = dayjs(
            `${currentDate.format("YYYY-MM-DD")} ${shift.shiftEnd}`
          );
          return (
            shift.availableDate === dayOfWeek &&
            slotStart.isSameOrAfter(shiftStart) &&
            slotEnd.isSameOrBefore(shiftEnd)
          );
        })
      );

      const overlappingReservations = reservations.filter((res) => {
        const resStart = dayjs(res.serviceStartTime);
        const resEnd = dayjs(res.serviceEndTime);
        return resStart.isBefore(slotEnd) && resEnd.isAfter(slotStart);
      });

      const canAssign = availableEngineers.some((eng) => {
        const reservedCount = overlappingReservations.filter(
          (res) => res.engineerId === eng.userId
        ).length;
        return reservedCount === 0;
      });

      if (!canAssign) {
        disabledSlots.push({
          date: currentDate.format("YYYY-MM-DD"),
          time,
          reason:
            availableEngineers.length === 0
              ? "NO_ENGINEER_AVAILABLE"
              : "FULLY_BOOKED",
        });
      }
    }

    currentDate = currentDate.add(1, "day");
  }

  return {
    range: { start: startDate, end: endDate },
    disabled: disabledSlots,
  };
}

/* ===============================
   예약 생성 + 기사 자동 배정
================================ */
async function createAndAssignReservation(userId, reservationDto) {
  const { businessId, iceMachineId, servicePolicyId } = reservationDto;

  if (!businessId || !iceMachineId || !servicePolicyId) {
    throw new myError("필수 예약 정보가 누락되었습니다.", BAD_REQUEST_ERROR);
  }

  // 1️⃣ business 소유 검증
  const business = await Business.findByPk(businessId);
  if (!business) {
    throw new myError("업체 정보를 찾을 수 없습니다.", NOT_FOUND_ERROR);
  }
  if (business.userId !== userId) {
    throw new myError("본인 업체만 예약할 수 있습니다.", CONFLICT_ERROR);
  }

  // 2️⃣ iceMachine 소속 검증
  const iceMachine = await IceMachine.findByPk(iceMachineId);
  if (!iceMachine) {
    throw new myError("제빙기 정보를 찾을 수 없습니다.", NOT_FOUND_ERROR);
  }
  if (iceMachine.businessId !== business.id) {
    throw new myError("해당 업체에 속하지 않은 제빙기입니다.", CONFLICT_ERROR);
  }

  // 3️⃣ 트랜잭션 시작
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

    // 🔹 1: pendingReservation 확인
    console.log("Pending Reservation:", pendingReservation);

    const engineers = await sequelize.query(
      `
      SELECT
        e.id AS engineer_id  -- 이제 PK 기준
      FROM
        engineers AS e
      JOIN
        engineer_shifts AS es ON es.engineer_id = e.id
      WHERE
        e.is_active = 1
        AND es.available_date = (DAYOFWEEK(:reservedDate) - 1)
        AND es.shift_start <= TIME(:serviceStartTime)
        AND es.shift_end >= TIME(:serviceEndTime)
      ORDER BY
        RAND()
      LIMIT 1;
      `,
      {
        replacements: {
          reservedDate: reservationDto.reservedDate,
          serviceStartTime: reservationDto.serviceStartTime,
          serviceEndTime: reservationDto.serviceEndTime,
        },
        transaction: t, // createReservation과 동일 트랜잭션 사용
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // 🔹 2: 배정 가능한 기사 확인
    console.log("배정 가능한 기사: ", engineers);
    console.log("Type of engineer_id:", typeof engineers[0]?.engineer_id);

    if (!engineers.length) {
      throw new myError("배정 가능한 기사가 없습니다.", CONFLICT_ERROR);
    }

    await reservationsRepository.updateReservation(
      pendingReservation.id,
      {
        engineerId: Number(engineers[0].engineer_id), // 🔹 3: 숫자로 강제 변환
        status: "CONFIRMED",
      },
      t
    );

    // 🔹 4: 업데이트 후 확인
    const updatedReservation = await reservationsRepository.findReservationById(
      pendingReservation.id,
      t
    );
    console.log("Updated Reservation:", updatedReservation);

    await t.commit();

    return updatedReservation;
  } catch (error) {
    await t.rollback();
    console.error("예약 생성 에러:", error); // 🔹 5: 에러 확인
    throw error;
  }
}

export default {
  getDisabledSlots,
  createAndAssignReservation,
};
