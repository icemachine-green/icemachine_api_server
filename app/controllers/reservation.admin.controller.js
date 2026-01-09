import reservationAdminService from "../services/reservation.admin.service.js";
import { createBaseResponse } from "../utils/createBaseResponse.util.js";
import { SUCCESS } from "../../configs/responseCode.config.js";

const reservationAdminController = {
  /**
   * GET /api/admin/dashboard/stats - 예약 상태별 통계 조회
   */
  getDashboardStats: async (req, res, next) => {
    try {
      // 쿼리 스트링에서 startDate 추출 (없으면 null)
      const { startDate } = req.query;

      const stats = await reservationAdminService.getDashboardStats(startDate);
      return res
        .status(SUCCESS.status)
        .send(createBaseResponse(SUCCESS, stats));
    } catch (error) {
      next(error);
    }
  },
  getReservations: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page || 1, 10);
      const limit = parseInt(req.query.limit || 10, 10);

      const {
        status,
        userName,
        engineerName,
        businessName, // [추가]
        totalSearch, // [추가] 통합 검색용
        orderBy,
        sortBy,
        reservationId,
        startDate,
      } = req.query;

      const filters = {
        status,
        userName,
        engineerName,
        businessName, // [추가]
        totalSearch, // [추가]
        orderBy,
        sortBy,
        reservationId: reservationId || null,
        startDate: startDate || null,
      };

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
