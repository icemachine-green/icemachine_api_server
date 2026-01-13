/**
 * @file routes/admin.subscription.router.js
 * @description 관리자 푸시 구독 라우터
 * 260113 v1.0.0 Lee init
 */
import express from "express";
import adminSubscriptionController from "../app/controllers/admin.subscription.controller.js";
import authAdminMiddleware from "../app/middlewares/auth/auth.admin.middleware.js";

const router = express.Router();

// 관리자 권한 확인 후 구독 정보 저장
router.post(
  "/",
  authAdminMiddleware,
  adminSubscriptionController.createSubscription
);

export default router;
