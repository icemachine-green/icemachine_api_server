/**
 * @file routes/admin.router.js
 * @description 관리자 관련 라우터
 * 251230 v1.0.0 jung init
 */
import express from "express";
import adminController from "../app/controllers/admin.controller.js";
// import authMiddleware from "../app/middlewares/auth.middleware.js"; // 추후 관리자 인증 미들웨어 추가

const router = express.Router();

// 관리자 - 전체 고객(customer) 조회
// 추후 실제 운영 시에는 authMiddleware를 추가하여 관리자만 접근 가능하도록 해야 합니다.
router.get('/customers', adminController.getCustomers);

export default router;