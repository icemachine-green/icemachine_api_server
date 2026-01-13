/**
 * @file routes/admin.router.js
 * @description 관리자 통합 라우터
 * 260113 v1.0.2 Lee update: 푸시 구독 라우터 추가
 */
import express from "express";
import adminNotificationController from "../app/controllers/admin.notification.controller.js";
import adminController from "../app/controllers/admin.controller.js";
import authAdminMiddleware from "../app/middlewares/auth/auth.admin.middleware.js";
import verifyRole from "../app/middlewares/auth/verifyRole.js";
import reservationAdminRouter from "./reservation.admin.router.js";
import adminSubscriptionRouter from "./admin.subscription.router.js"; // 신규 추가

const router = express.Router();

// --- 인증이 필요 없는 경로 ---
router.post("/login", adminController.loginAdmin);
router.post("/reissue", adminController.reissue);

// --- 인증이 필요한 경로 (authAdminMiddleware 적용) ---

// 1. 관리자 푸시 구독 (추가)
// /api/admin/subscriptions 경로로 연결됩니다.
router.use("/subscriptions", adminSubscriptionRouter);

// 2. 관리자 알림(DB 내역) 관리
router.get(
  "/notifications",
  authAdminMiddleware,
  adminNotificationController.getNotifications
);
router.patch(
  "/notifications/:id/read",
  authAdminMiddleware,
  adminNotificationController.markAsRead
);
router.patch(
  "/notifications/:id/work",
  authAdminMiddleware,
  adminNotificationController.updateWorkStatus
);
router.patch(
  "/notifications/:id/hide",
  authAdminMiddleware,
  adminNotificationController.hideNotification
);

// 3. 관리자 계정 생성 (SUPER_ADMIN 전용)
router.post(
  "/accounts",
  authAdminMiddleware,
  verifyRole(["SUPER_ADMIN"]),
  adminController.createAdminAccount
);

// 4. 예약 관리
router.use("/", reservationAdminRouter);

export default router;
