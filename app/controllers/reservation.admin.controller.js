/**
 * @file app/controllers/reservation.admin.controller.js
 */
import reservationAdminService from "../services/reservation.admin.service.js";
import { createBaseResponse } from "../utils/createBaseResponse.util.js";
import { SUCCESS } from "../../configs/responseCode.config.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

const reservationAdminController = {
  getDashboardStats: asyncHandler(async (req, res) => {
    // 프론트에서 넘어온 ?mode=today&startDate=... 전체를 서비스로 전달
    const stats = await reservationAdminService.getDashboardStats(req.query);
    return res.status(SUCCESS.status).send(createBaseResponse(SUCCESS, stats));
  }),

  getReservations: asyncHandler(async (req, res) => {
    const { page, limit, ...filters } = req.query;
    const result = await reservationAdminService.getReservations(
      page,
      limit,
      filters
    );
    return res.status(SUCCESS.status).send(createBaseResponse(SUCCESS, result));
  }),

  getReservationDetail: asyncHandler(async (req, res) => {
    const reservation = await reservationAdminService.getReservationDetail(
      req.params.id
    );
    return res
      .status(SUCCESS.status)
      .send(createBaseResponse(SUCCESS, reservation));
  }),

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

  /**
   * 재배정 추천 기사 리스트 조회
   * 260111 v1.0.0 Taeho-update
   */
  getRecommendedEngineers: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const engineers = await reservationAdminService.getRecommendedEngineers(id);

    return res
      .status(SUCCESS.status)
      .send(createBaseResponse(SUCCESS, engineers));
  }),

  /**
   * 기사 배정 확정
   * 260111 v1.1.0 Taeho-update (Assign logic 추가)
   */
  assignEngineer: asyncHandler(async (req, res) => {
    const { id } = req.params; // 예약 ID
    const { engineerId } = req.body; // 배정할 기사 ID

    if (!engineerId) {
      throw myError("배정할 기사 ID가 누락되었습니다.", BAD_REQUEST_ERROR);
    }

    await reservationAdminService.assignEngineer(id, engineerId);

    return res
      .status(SUCCESS.status)
      .send(
        createBaseResponse(
          SUCCESS,
          null,
          "기사 배정이 성공적으로 완료되었습니다."
        )
      );
  }),
};

export default reservationAdminController;
