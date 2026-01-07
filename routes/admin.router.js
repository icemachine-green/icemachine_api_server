import express from "express";
import adminNotificationController from "../app/controllers/admin.notification.controller.js";
import adminController from "../app/controllers/admin.controller.js";
import authAdminMiddleware from "../app/middlewares/auth/auth.admin.middleware.js";
import verifyRole from "../app/middlewares/auth/verifyRole.js";
import reservationAdminRouter from "./reservation.admin.router.js"; // 경로 수정

const router = express.Router();

// NOTE: 모든 /admin 경로에 관리자 인증 미들웨어 적용 (추후 활성화)
// router.use(authAdminMiddleware); // 이 미들웨어를 전역적으로 사용하지 않으므로 각 라우트에 개별 적용

// API for AdminNotification
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

// API for Admin Account Management
router.post(
  "/accounts",
  authAdminMiddleware,
  verifyRole(["SUPER_ADMIN"]),
  adminController.createAdminAccount
);

// API for Admin Login
router.post("/login", adminController.loginAdmin);
router.post("/reissue", adminController.reissue);

// API for Admin Reservation Management
router.use("/", reservationAdminRouter); // 새로운 예약 관리 라우터 마운트

export default router;
