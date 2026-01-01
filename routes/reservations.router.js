/**
 * @file routes/reservations.router.js
 * @description 예약 관련 라우터
 * 251231 v1.0.0 You init
 */
import express from "express";
import reservationsController from "../app/controllers/reservations.controller.js";
import authMiddleware from "../app/middlewares/auth/auth.middleware.js";
/**
 * 예약 도메인 Router
 *
 * - URL과 Controller를 연결하는 진입점
 * - 인증(authMiddleware) 적용
 * - 비즈니스 로직 없음
 *
 * 역할
 * 1) 예약 생성 + 기사 자동 배정 요청 전달
 * 2) 예약 가능 여부(availability) 조회 요청 전달
 */

const router = express.Router();

// 예약 생성 및 자동 배정
router.post(
  "/",
  authMiddleware,
  reservationsController.createAndAssignReservation
);

// 예약 가능 여부 조회
router.get(
  "/availability",
  authMiddleware,
  reservationsController.getAvailability
);

export default router;
