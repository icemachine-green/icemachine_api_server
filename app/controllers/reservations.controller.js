/**
 * @file app/controllers/reservations.controller.js
 * @description 예약 관련 컨트롤러
 * 251231 v1.0.0
 */

import reservationsService from "../services/reservations.service.js";
import { createBaseResponse } from "../utils/createBaseResponse.util.js";
import { SUCCESS, FORBIDDEN_ERROR } from "../../configs/responseCode.config.js";
import myError from "../errors/customs/my.error.js";

async function getAvailability(req, res, next) {
  try {
    const { startDate, endDate, servicePolicyId } = req.query;

    const result = await reservationsService.getDisabledSlots(
      startDate,
      endDate,
      servicePolicyId
    );

    return res.status(SUCCESS.status).send(createBaseResponse(SUCCESS, result));
  } catch (error) {
    next(error);
  }
}

async function createAndAssignReservation(req, res, next) {
  try {
    const { id: userId } = req.user;
    const reservationDto = req.body;
    console.log("reservationDto", reservationDto); // 잘 받아옴

    const result = await reservationsService.createAndAssignReservation(
      userId,
      reservationDto
    );

    return res.status(SUCCESS.status).send(createBaseResponse(SUCCESS, result));
  } catch (error) {
    next(error);
  }
}

async function cancelReservation(req, res, next) {
  try {
    const { reservationId } = req.params;
    const { id: userId } = req.user; // Authenticated user ID

    await reservationsService.cancelReservation(reservationId, userId);

    return res.status(SUCCESS.status).send(
      createBaseResponse(SUCCESS, {
        message: "예약이 성공적으로 취소되었습니다.",
      })
    );
  } catch (error) {
    next(error);
  }
}

async function getReservationsForUser(req, res, next) {
  try {
    const { userId } = req.params;
    const { status } = req.query;
    const authenticatedUserId = req.user.id;

    // Authorization check: User can only access their own reservations.
    if (parseInt(userId, 10) !== authenticatedUserId) {
      throw new myError(
        "자신의 예약 정보만 조회할 수 있습니다.",
        FORBIDDEN_ERROR
      );
    }

    const reservations = await reservationsService.getReservationsForUser(
      userId,
      status
    );

    return res
      .status(SUCCESS.status)
      .send(createBaseResponse(SUCCESS, reservations));
  } catch (error) {
    next(error);
  }
}

export default {
  getAvailability,
  createAndAssignReservation,
  cancelReservation,
  getReservationsForUser,
};
