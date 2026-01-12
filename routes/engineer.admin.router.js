import express from "express";
import engineerAdminController from "../app/controllers/engineer.admin.controller.js";
import authAdminMiddleware from "../app/middlewares/auth/auth.admin.middleware.js";

const router = express.Router();

// 모든 라우트에 관리자 인증 미들웨어 적용
router.use(authAdminMiddleware);

// 1. 기사 목록 조회 (필터링, 정렬 포함) 및 상단 통계
router.get("/", engineerAdminController.getEngineers);

// 2. 기사 상세 정보 조회
router.get("/:id", engineerAdminController.getEngineerDetail);

// 3. 기사 정보 수정 (기술등급 등)
router.patch("/:id", engineerAdminController.updateEngineerInfo);

// 4. 기사 상태 제어 (활성/비활성/퇴사 처리)
router.patch("/:id/status", engineerAdminController.updateEngineerStatus);

export default router;
