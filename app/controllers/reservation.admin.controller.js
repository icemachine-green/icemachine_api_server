import reservationAdminService from "../services/reservation.admin.service.js";
import { createBaseResponse } from "../utils/createBaseResponse.util.js";
import { SUCCESS } from "../../configs/responseCode.config.js";
import myError from "../errors/customs/my.error.js";

const reservationAdminController = {
  /**
   * GET /api/admin/dashboard/stats - 예약 상태별 통계 조회
   */
  getDashboardStats: async (req, res, next) => {
    try {
      const stats = await reservationAdminService.getDashboardStats();
      return res
        .status(SUCCESS.status)
        .send(createBaseResponse(SUCCESS, stats));
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/admin/reservations - 관리자용 예약 목록 조회
   */
  getReservations: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page || 1, 10);
      const limit = parseInt(req.query.limit || 10, 10);
      const { status, userName, engineerName } = req.query;

      const filters = { status, userName, engineerName };

      const result = await reservationAdminService.getReservations(
        page,
        limit,
        filters
      );
      return res
        .status(SUCCESS.status)
        .send(createBaseResponse(SUCCESS, result));
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/admin/reservations/:id - 특정 예약 상세 정보 조회
   */
  getReservationDetail: async (req, res, next) => {
    try {
      const { id } = req.params;
      const reservation = await reservationAdminService.getReservationDetail(
        id
      );
      return res
        .status(SUCCESS.status)
        .send(createBaseResponse(SUCCESS, reservation));
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/admin/reservations/:id/status - 예약 상태 강제 업데이트
   */
  updateReservationStatus: async (req, res, next) => {
    try {
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
    } catch (error) {
      next(error);
    }
  },
};

export default reservationAdminController;
