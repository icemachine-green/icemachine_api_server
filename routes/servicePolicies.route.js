/**
 * @file app/routes/servicePolicies.router.js
 * @description 서비스 정책 관련 라우터
 * 260109 v1.0.0
 */
import express from "express";
import servicePoliciesController from "../app/controllers/servicePolicies.controller.js";

const router = express.Router();

// 모든 서비스 정책 조회 (기본 가격, 시간, 설명 등 포함)
router.get("/", servicePoliciesController.getAllPolicies);

export default router;
