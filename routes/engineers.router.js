/**
 * @file routes/engineers.router.js
 * @description 기사 관련 라우터
 * 260106 v1.0.0 Jung init
 */
import express from "express";
import engineersController from "../app/controllers/engineers.controller.js";
import authMiddleware from "../app/middlewares/auth/auth.middleware.js";
import engineersValidator from "../app/middlewares/validations/validators/engineers.validator.js";
import validationHandler from "../app/middlewares/validations/validation.handler.js";

const router = express.Router();

// Engineer 전용 API
router.get("/me/dashboard", authMiddleware, engineersController.getDashboard); // dashboard(메인페이지) 출력
router.get("/me/reservations", authMiddleware, engineersValidator.reservationValidator, validationHandler, engineersController.getMyReservations); // 예약 목록 조회
router.get("/me/reservations/:reservationId", authMiddleware, engineersController.getReservationDetail); // 예약(작업) 상세 조회
router.get("/me/calendar", authMiddleware, engineersController.getMonthlyCalendar); // 달력으로 예약건수 표시
router.post("/me/reservations/:reservationId/start", authMiddleware, engineersController.startWork); // 작업 시작
router.post("/me/reservations/:reservationId/complete", authMiddleware, engineersController.completeWork); // 작업 완료
router.post("/me/reservations/:reservationId/cancel", authMiddleware, engineersController.cancelWork); // 작업 취소

export default router;