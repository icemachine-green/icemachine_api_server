/**
 * @file app/services/reservations.service.js
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
  DB_ERROR,
} from "../../configs/responseCode.config.js";

const { sequelize, ServicePolicy, User, Engineer } = db;

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const getDisabledSlots = async (startDate, endDate, servicePolicyId) => {
  if (!startDate || !endDate || !servicePolicyId) {
    throw myError("필수 파라미터가 누락되었습니다.", BAD_REQUEST_ERROR);
  }

  const servicePolicy = await ServicePolicy.findByPk(servicePolicyId);
  if (!servicePolicy) {
    throw myError("서비스 정책을 찾을 수 없습니다.", NOT_FOUND_ERROR);
  }

  try {
    const serviceDuration = servicePolicy.standardDuration;
    const reservations =
      await reservationsRepository.findReservationsByDateRange(
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
    const now = dayjs();
    const BUFFER_TIME = 60;

    let currentDate = dayjs(startDate);
    const lastDate = dayjs(endDate);

    while (currentDate.isSameOrBefore(lastDate)) {
      const dayOfWeek = currentDate.day();
      for (const time of timeSlots) {
        const slotStart = dayjs(`${currentDate.format("YYYY-MM-DD")} ${time}`);
        const slotEnd = slotStart.add(serviceDuration, "minute");

        if (slotStart.isBefore(now.add(3, "hour"))) {
          disabledSlots.push({
            date: currentDate.format("YYYY-MM-DD"),
            time,
            reason: "TOO_CLOSE_OR_PAST",
          });
          continue;
        }

        const availableEngineers = engineersWithShifts.filter((eng) =>
          eng.EngineerShifts.some(
            (shift) =>
              shift.availableDate === dayOfWeek &&
              slotStart.format("HH:mm:ss") >= shift.shiftStart &&
              slotEnd.format("HH:mm:ss") <= shift.shiftEnd
          )
        );

        const canAssign = availableEngineers.some((eng) => {
          return !reservations.some((res) => {
            if (res.engineerId !== eng.id) return false;
            const resStart = dayjs(res.serviceStartTime).subtract(
              BUFFER_TIME,
              "minute"
            );
            const resEnd = dayjs(res.serviceEndTime).add(BUFFER_TIME, "minute");
            return slotStart.isBefore(resEnd) && slotEnd.isAfter(resStart);
          });
        });

        if (!canAssign) {
          disabledSlots.push({
            date: currentDate.format("YYYY-MM-DD"),
            time,
            reason:
              availableEngineers.length === 0
                ? "NO_ENGINEER_SHIFT"
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
  } catch (error) {
    throw myError("가용 슬롯 조회 중 오류가 발생했습니다.", DB_ERROR);
  }
};

const createAndAssignReservation = async (userId, reservationDto) => {
  const {
    businessId,
    iceMachineId,
    reservedDate,
    serviceStartTime,
    serviceEndTime,
  } = reservationDto;

  if (!businessId || !iceMachineId) {
    throw myError("필수 파라미터가 누락되었습니다.", BAD_REQUEST_ERROR);
  }

  const business = await businessesRepository.findBusinessById(businessId);
  if (!business)
    throw myError("해당 매장을 찾을 수 없습니다.", NOT_FOUND_ERROR);
  if (business.userId !== userId)
    throw myError("매장 접근 권한이 없습니다.", FORBIDDEN_ERROR);

  const t = await sequelize.transaction();

  try {
    const pendingReservation = await reservationsRepository.createReservation(
      { ...reservationDto, userId, status: "PENDING", engineerId: null },
      t
    );

    const [engineer] = await sequelize.query(
      `
            SELECT e.id AS engineer_id
            FROM engineers AS e
            JOIN engineer_shifts AS es ON es.engineer_id = e.id
            WHERE e.is_active = 1
              AND es.available_date = (DAYOFWEEK(:reservedDate) - 1)
              AND es.shift_start <= TIME(:serviceStartTime)
              AND es.shift_end >= TIME(:serviceEndTime)
              AND NOT EXISTS (
                SELECT 1 FROM reservations AS r
                WHERE r.engineer_id = e.id
                  AND r.status IN ('CONFIRMED', 'START')
                  AND DATE_ADD(r.service_end_time, INTERVAL 1 HOUR) > :serviceStartTime
                  AND DATE_SUB(r.service_start_time, INTERVAL 1 HOUR) < :serviceEndTime
              )
            ORDER BY RAND() LIMIT 1;
            `,
      {
        replacements: { reservedDate, serviceStartTime, serviceEndTime },
        transaction: t,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!engineer) {
      throw myError(
        "배정 가능한 기사가 없습니다 (이동시간 미확보 포함).",
        CONFLICT_ERROR
      );
    }

    const engineerId = engineer.engineer_id;
    const isUpdated = await reservationsRepository.updateReservation(
      pendingReservation.id,
      { engineerId, status: "CONFIRMED" },
      t
    );

    if (!isUpdated)
      throw myError("기사 배정 업데이트에 실패했습니다.", DB_ERROR);

    const result = await reservationsRepository.findReservationById(
      pendingReservation.id,
      t
    );
    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    if (error.status) throw error;
    throw myError(`[RESERVATION_CREATE_FAIL] ${error.message}`, DB_ERROR);
  }
};

const getReservationsForUser = async (userId, status = null) => {
  try {
    const businesses = await businessesRepository.findBusinessesByUserId(
      userId
    );
    const businessIds = businesses.map((b) => b.id);
    if (!businessIds.length) return [];

    const reservations =
      await reservationsRepository.findReservationsByBusinessIds(
        businessIds,
        status
      );

    return Promise.all(
      reservations.map(async (res) => {
        let engineerName = "배정 중";
        let engineerPhone = null;

        if (res.engineerId) {
          const engineerRecord = await Engineer.findByPk(res.engineerId, {
            include: [{ model: User, attributes: ["name", "phoneNumber"] }],
          });
          if (engineerRecord?.User) {
            engineerName = engineerRecord.User.name;
            engineerPhone = engineerRecord.User.phoneNumber;
          }
        }

        return {
          id: res.id,
          businessId: res.businessId,
          iceMachineId: res.iceMachineId,
          servicePolicyId: res.servicePolicyId,
          reservedDate: dayjs(res.reservedDate).format("YYYY-MM-DD"),
          serviceWindow: `${dayjs(res.serviceStartTime).format(
            "HH:mm"
          )} ~ ${dayjs(res.serviceEndTime).format("HH:mm")}`,
          status: res.status,
          engineerName,
          engineerPhone,
        };
      })
    );
  } catch (error) {
    throw myError(`[RESERVATION_FETCH_FAIL] ${error.message}`, DB_ERROR);
  }
};

const cancelReservation = async (reservationId, userId) => {
  const t = await sequelize.transaction();
  try {
    const reservation = await reservationsRepository.findReservationById(
      reservationId,
      t
    );
    if (!reservation)
      throw myError("예약을 찾을 수 없습니다.", NOT_FOUND_ERROR);
    if (reservation.userId !== userId)
      throw myError("취소 권한이 없습니다.", FORBIDDEN_ERROR);

    if (dayjs(reservation.serviceStartTime).diff(dayjs(), "hour") < 24) {
      throw myError(
        "서비스 시작 24시간 이내에는 취소할 수 없습니다.",
        CONFLICT_ERROR
      );
    }

    await reservationsRepository.updateReservation(
      reservationId,
      { status: "CANCELED" },
      t
    );
    await t.commit();
    return true;
  } catch (error) {
    await t.rollback();
    if (error.status) throw error;
    throw myError(`[RESERVATION_CANCEL_FAIL] ${error.message}`, DB_ERROR);
  }
};

export default {
  getDisabledSlots,
  createAndAssignReservation,
  getReservationsForUser,
  cancelReservation,
};
