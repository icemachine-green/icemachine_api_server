/**
 * @file app/controllers/reservations.controller.js
 */
import reservationsService from "../services/reservations.service.js";
import { createBaseResponse } from "../utils/createBaseResponse.util.js";
import { SUCCESS, FORBIDDEN_ERROR } from "../../configs/responseCode.config.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import myError from "../errors/customs/my.error.js";

/**
 * 예약 불가능 슬롯 조회
 */
const getAvailability = asyncHandler(async (req, res) => {
  const { startDate, endDate, servicePolicyId } = req.query;

  const result = await reservationsService.getDisabledSlots(
    startDate,
    endDate,
    servicePolicyId
  );

  return res.status(SUCCESS.status).send(createBaseResponse(SUCCESS, result));
});

/**
 * 예약 생성 및 기사 자동 배정
 */
const createAndAssignReservation = asyncHandler(async (req, res) => {
  const { id: userId } = req.user;

  const result = await reservationsService.createAndAssignReservation(
    userId,
    req.body
  );

  return res.status(SUCCESS.status).send(createBaseResponse(SUCCESS, result));
});

/**
 * 점주용 예약 목록 조회
 */
const getReservationsForUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { status } = req.query;

  // 본인 확인 로직 유지
  if (parseInt(userId, 10) !== req.user.id) {
    throw myError("자신의 예약 정보만 조회할 수 있습니다.", FORBIDDEN_ERROR);
  }

  const reservations = await reservationsService.getReservationsForUser(
    userId,
    status
  );

  return res
    .status(SUCCESS.status)
    .send(createBaseResponse(SUCCESS, reservations));
});

/**
 * 예약 취소
 */
const cancelReservation = asyncHandler(async (req, res) => {
  const { reservationId } = req.params;
  const { id: userId } = req.user;

  await reservationsService.cancelReservation(parseInt(reservationId), userId);

  return res
    .status(SUCCESS.status)
    .send(createBaseResponse(SUCCESS, { message: "예약이 취소되었습니다." }));
});

export default {
  getAvailability,
  createAndAssignReservation,
  getReservationsForUser,
  cancelReservation,
};
