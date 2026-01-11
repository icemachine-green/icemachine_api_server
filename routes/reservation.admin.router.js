import express from "express";
import reservationAdminController from "../app/controllers/reservation.admin.controller.js";
import authAdminMiddleware from "../app/middlewares/auth/auth.admin.middleware.js";
import verifyRole from "../app/middlewares/auth/verifyRole.js";

const router = express.Router();

// 모든 라우트에 관리자 인증 미들웨어 적용
router.use(authAdminMiddleware);

// 1. 대시보드 통계 조회
router.get("/dashboard/stats", reservationAdminController.getDashboardStats);

// 2. 전체 예약 목록 조회
router.get("/reservations", reservationAdminController.getReservations);

// 3. 예약 상세 정보 조회
router.get(
  "/reservations/:id",
  reservationAdminController.getReservationDetail
);

// 4. 예약 상태 강제 업데이트
router.patch(
  "/reservations/:id/status",
  reservationAdminController.updateReservationStatus
);

/**
 *  추천 기사 리스트 조회 라우트 추가
 * GET /api/admin/reservations/:id/recommend-engineers
 */
router.get(
  "/:id/recommend-engineers",
  reservationAdminController.getRecommendedEngineers
);

/**
 * 🚩 신규: 기사 배정 확정
 * Full Path: PATCH /api/admin/reservations/:id/assign
 */
router.patch(
  "/reservations/:id/assign",
  reservationAdminController.assignEngineer
);
export default router;
