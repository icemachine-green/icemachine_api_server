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
import businessesRepository from "../repositories/businesses.repository.js";
import myError from "../errors/customs/my.error.js";
import {
  BAD_REQUEST_ERROR,
  NOT_FOUND_ERROR,
  CONFLICT_ERROR,
  FORBIDDEN_ERROR,
} from "../../configs/responseCode.config.js";

const { sequelize, ServicePolicy, Business, IceMachine, User, Engineer } = db;

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

  // [추가] 현재 시간 기준점
  const now = dayjs();

  while (currentDate.isSameOrBefore(lastDate)) {
    const dayOfWeek = currentDate.day();

    for (const time of timeSlots) {
      const slotStart = dayjs(`${currentDate.format("YYYY-MM-DD")} ${time}`);
      const slotEnd = slotStart.add(serviceDuration, "minute");

      // [핵심 추가] 오늘 날짜인데 현재 시간보다 이전(또는 3시간 이내)인 슬롯 블락
      if (slotStart.isBefore(now.add(3, "hour"))) {
        disabledSlots.push({
          date: currentDate.format("YYYY-MM-DD"),
          time,
          reason: "TOO_CLOSE_OR_PAST",
        });
        continue;
      }

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
  const {
    businessId,
    iceMachineId,
    servicePolicyId,
    reservedDate,
    serviceStartTime,
    serviceEndTime,
  } = reservationDto;

  if (!businessId || !iceMachineId || !servicePolicyId) {
    throw new myError("필수 예약 정보가 누락되었습니다.", BAD_REQUEST_ERROR);
  }

  // [추가] 생성 시점에도 현재 시간 기준 3시간 버퍼 검증
  const now = dayjs();
  if (
    dayjs(`${reservedDate} ${serviceStartTime}`).isBefore(now.add(3, "hour"))
  ) {
    throw new myError("최소 3시간 전 예약만 가능합니다.", BAD_REQUEST_ERROR);
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

    // [개선] 배정 쿼리: 해당 시간대에 이미 확정된 예약이 있는 기사 제외 로직 추가
    const engineers = await sequelize.query(
      `
      SELECT
        e.id AS engineer_id
      FROM
        engineers AS e
      JOIN
        engineer_shifts AS es ON es.engineer_id = e.id
      WHERE
        e.is_active = 1
        AND es.available_date = (DAYOFWEEK(:reservedDate) - 1)
        AND es.shift_start <= TIME(:serviceStartTime)
        AND es.shift_end >= TIME(:serviceEndTime)
        AND NOT EXISTS (
          SELECT 1 FROM reservations AS r
          WHERE r.engineer_id = e.id
            AND r.status IN ('CONFIRMED', 'START')
            AND r.service_start_time < :serviceEndTime
            AND r.service_end_time > :serviceStartTime
        )
      ORDER BY
        RAND()
      LIMIT 1;
      `,
      {
        replacements: {
          reservedDate,
          serviceStartTime,
          serviceEndTime,
        },
        transaction: t,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!engineers.length) {
      throw new myError("배정 가능한 기사가 없습니다.", CONFLICT_ERROR);
    }

    await reservationsRepository.updateReservation(
      pendingReservation.id,
      {
        engineerId: Number(engineers[0].engineer_id),
        status: "CONFIRMED",
      },
      t
    );

    const updatedReservation = await reservationsRepository.findReservationById(
      pendingReservation.id,
      t
    );

    await t.commit();
    return updatedReservation;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

async function cancelReservation(reservationId, userId) {
  const t = await sequelize.transaction();

  try {
    const reservation = await reservationsRepository.findReservationById(
      reservationId,
      t
    );

    if (!reservation) {
      throw new myError("예약을 찾을 수 없습니다.", NOT_FOUND_ERROR);
    }

    if (reservation.userId !== userId) {
      throw new myError("해당 예약에 대한 권한이 없습니다.", FORBIDDEN_ERROR);
    }

    if (!["PENDING", "CONFIRMED"].includes(reservation.status)) {
      throw new myError(
        `현재 예약 상태(${reservation.status})에서는 취소할 수 없습니다.`,
        BAD_REQUEST_ERROR
      );
    }

    const serviceStartTime = dayjs(reservation.serviceStartTime);
    const now = dayjs();
    const diffHours = serviceStartTime.diff(now, "hour");

    if (diffHours < 24) {
      throw new myError(
        "서비스 시작 24시간 전에는 취소할 수 없습니다. 고객센터에 문의하세요.",
        CONFLICT_ERROR
      );
    }

    const isUpdated = await reservationsRepository.updateReservation(
      reservationId,
      { status: "CANCELED" },
      t
    );

    if (!isUpdated) {
      throw new myError("예약 취소에 실패했습니다.", CONFLICT_ERROR);
    }

    await t.commit();
    return true;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

const getReservationsForUser = async (userId, status = null) => {
  const businesses = await businessesRepository.findBusinessesByUserId(userId);
  const businessIds = businesses.map((business) => business.id);

  if (businessIds.length === 0) {
    return [];
  }

  const reservations =
    await reservationsRepository.findReservationsByBusinessIds(
      businessIds,
      status
    );

  const formattedReservations = await Promise.all(
    reservations.map(async (reservation) => {
      let engineerName = "배정 중";
      let engineerPhone = null;

      if (reservation.engineerId) {
        const engineerRecord = await Engineer.findByPk(reservation.engineerId);
        if (engineerRecord) {
          const engineerUser = await User.findByPk(engineerRecord.userId);
          if (engineerUser) {
            engineerName = engineerUser.name;
            engineerPhone = engineerUser.phoneNumber;
          }
        }
      }

      return {
        id: reservation.id,
        businessId: reservation.businessId,
        iceMachineId: reservation.iceMachineId,
        servicePolicyId: reservation.servicePolicyId,
        reservedDate: dayjs(reservation.reservedDate).format("YYYY-MM-DD"),
        serviceWindow: `${dayjs(reservation.serviceStartTime).format(
          "HH:mm"
        )} ~ ${dayjs(reservation.serviceEndTime).format("HH:mm")}`,
        status: reservation.status,
        engineerName: engineerName,
        engineerPhone: engineerPhone,
      };
    })
  );

  return formattedReservations;
};

export default {
  getDisabledSlots,
  createAndAssignReservation,
  cancelReservation,
  getReservationsForUser,
};
