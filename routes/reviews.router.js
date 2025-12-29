/**
 * @file routes/reviews.router.js
 * @description 리뷰 관련 라우터
 * 251229 v1.0.0 Lee init
 */
import express from "express";
import reviewsController from "../app/controllers/reviews.controller.js";
import authMiddleware from "../app/middlewares/auth/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: 리뷰 관련 API
 */

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: 모든 리뷰 목록 조회
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [latest, highest, lowest]
 *         description: "정렬 기준 (기본값: latest)"
 *     responses:
 *       200:
 *         description: 리뷰 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 payload:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       imageUrl:
 *                         type: string
 *                         nullable: true
 *                         example: "https://example.com/review.jpg"
 *                       rating:
 *                         type: integer
 *                         example: 5
 *                       content:
 *                         type: string
 *                         example: "아주 만족합니다!"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-12-29 10:00:00"
 *                       user_name:
 *                         type: string
 *                         example: "김태호"
 */
router.get("/", reviewsController.getAllReviews);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: 새 리뷰 작성
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 description: 별점 (1~5)
 *                 example: 5
 *               quickOption:
 *                 type: string
 *                 description: 빠른 선택 옵션
 *                 example: "사장님이 친절해요"
 *               content:
 *                 type: string
 *                 description: 리뷰 내용
 *                 example: "다음에 또 방문하고 싶네요!"
 *               imageUrl:
 *                 type: string
 *                 description: 이미지 URL
 *                 nullable: true
 *                 example: "https://example.com/my_review.jpg"
 *     responses:
 *       200:
 *         description: 리뷰 작성 성공. 새로 생성된 리뷰 정보를 반환합니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 payload:
 *                   type: object
 *                   properties:
 *                      id:
 *                        type: integer
 *                      userId:
 *                        type: integer
 *                      rating:
 *                        type: integer
 *                      content:
 *                        type: string
 *                      # ... 등 Review 모델의 모든 필드
 *       401:
 *         description: 인증 실패 (토큰 누락, 유효하지 않은 토큰 등)
 */
router.post("/", authMiddleware, reviewsController.createReview);

export default router;
