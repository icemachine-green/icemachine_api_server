/**
 * @file routes/reservations.router.js
 * @description 예약 관련 라우터
 * 251231 v1.0.0 You init
 */
import express from "express";
import reservationsController from "../app/controllers/reservations.controller.js";
import authMiddleware from "../app/middlewares/auth/auth.middleware.js";

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
