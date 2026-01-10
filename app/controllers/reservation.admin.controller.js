/**
 * @file app/controllers/reservation.admin.controller.js
 */
import reservationAdminService from "../services/reservation.admin.service.js";
import { createBaseResponse } from "../utils/createBaseResponse.util.js";
import { SUCCESS } from "../../configs/responseCode.config.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

const reservationAdminController = {
  /**
   * GET /api/admin/dashboard/stats - 예약 상태별 통계 조회
   */
  getDashboardStats: asyncHandler(async (req, res) => {
    const stats = await reservationAdminService.getDashboardStats(
      req.query.startDate
    );
    return res.status(SUCCESS.status).send(createBaseResponse(SUCCESS, stats));
  }),

  /**
   * GET /api/admin/reservations - 예약 목록 조회
   */
  getReservations: asyncHandler(async (req, res) => {
    const { page, limit, ...filters } = req.query;
    const result = await reservationAdminService.getReservations(
      page,
      limit,
      filters
    );
    return res.status(SUCCESS.status).send(createBaseResponse(SUCCESS, result));
  }),

  /**
   * GET /api/admin/reservations/:id - 특정 예약 상세 정보 조회
   */
  getReservationDetail: asyncHandler(async (req, res) => {
    const reservation = await reservationAdminService.getReservationDetail(
      req.params.id
    );
    return res
      .status(SUCCESS.status)
      .send(createBaseResponse(SUCCESS, reservation));
  }),

  /**
   * PATCH /api/admin/reservations/:id/status - 예약 상태 강제 업데이트
   */
  updateReservationStatus: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    await reservationAdminService.updateReservationStatus(id, status);
    return res
      .status(SUCCESS.status)
      .send(
        createBaseResponse(
          SUCCESS,
          null,
          "예약 상태가 성공적으로 업데이트되었습니다."
        )
      );
  }),
};

export default reservationAdminController;
