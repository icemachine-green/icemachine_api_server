/**
 * @file routes/engineers.router.js
 * @description 기사 관련 라우터
 * 260106 v1.0.0 Jung init
 */
import express from "express";
import engineersController from "../app/controllers/engineers.controller.js";
import authMiddleware from "../app/middlewares/auth/auth.middleware.js";

const router = express.Router();

// 인증 관련 라우터
router.get("/kakao/authorize", engineersController.kakaoAuthorize);
router.get("/kakao/callback", engineersController.kakaoCallback);
router.post("/social-signup", engineersController.socialSignup);
router.post("/reissue", engineersController.reissue);

// Engineer 전용 API
// router.get("/me/dashboard", authMiddleware, engineersController.getDashboard);
// router.get("/me/reservations", authMiddleware, engineersController.getMyReservations);
// router.get("/me/reservations/:reservationId", authMiddleware, engineersController.getReservationDetail);
// router.get("/me/calendar", authMiddleware, engineersController.getMonthlyCalendar);
// router.post("/me/reservations/:reservationId/start", authMiddleware, engineersController.startWork);
// router.post("/me/reservations/:reservationId/complete", authMiddleware, engineersController.completeWork);
// router.post("/me/reservations/:reservationId/cancel", authMiddleware, engineersController.cancelWork);

// TODO: 테스트 작업 완료 후 authMiddleware 추가
router.get("/me/dashboard", engineersController.getDashboard); // dashboard(메인페이지) 출력
router.get("/me/reservations", engineersController.getMyReservations); // 예약 목록 조회
router.get("/me/reservations/:reservationId", engineersController.getReservationDetail); // 예약(작업) 상세 조회
router.get("/me/calendar", engineersController.getMonthlyCalendar); // 달력으로 예약건수 표시

router.post("/me/reservations/:reservationId/start", engineersController.startWork); // 작업 시작
router.post("/me/reservations/:reservationId/complete", engineersController.completeWork); // 작업 완료
router.post("/me/reservations/:reservationId/cancel", engineersController.cancelWork); // 작업 취소

export default router;