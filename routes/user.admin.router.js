/**
 * @file routes/user.admin.router.js
 * @description 관리자용 고객 관리(조회, 검색, 상세) 라우터
 */
import express from "express";
import userAdminController from "../app/controllers/user.admin.controller.js";
import authAdminMiddleware from "../app/middlewares/auth/auth.admin.middleware.js";

const router = express.Router();

// 모든 고객 관리 API는 관리자 인증을 거쳐야 함
router.use(authAdminMiddleware);

/**
 * 🚩 고객 관리 API 리스트
 * 1. 전체 고객 목록 조회 (검색/필터/정렬/페이징)
 */
router.get("/", userAdminController.getUsers);

/**
 * 고객 관리 API 리스트
 * 2. 특정 고객 상세 조회 (통계/매장/기본정보/이력)
 */
router.get("/:id", userAdminController.getUserDetail);

export default router;
