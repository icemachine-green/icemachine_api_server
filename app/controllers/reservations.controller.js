/**
 * @file app/controllers/reservations.controller.js
 * @description 예약 관련 컨트롤러
 * 251231 v1.0.0
 */

import reservationsService from "../services/reservations.service.js";
import { createBaseResponse } from "../utils/createBaseResponse.util.js";
import { SUCCESS } from "../../configs/responseCode.config.js";

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

export default {
  getAvailability,
  createAndAssignReservation,
};
