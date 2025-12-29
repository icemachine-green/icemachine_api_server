/**
 * @file routes/businesses.router.js
 * @description 업체 관련 라우터
 * 251229 v1.0.0 Lee init
 */
import express from "express";
import businessesController from "../app/controllers/businesses.controller.js";
import authMiddleware from "../app/middlewares/auth/auth.middleware.js"; // authMiddleware import

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Businesses
 *   description: 매장(업체) 관련 API
 */

/**
 * @swagger
 * /api/businesses:
 *   post:
 *     summary: 새 매장 및 제빙기 등록
 *     tags: [Businesses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - mainAddress
 *               - phoneNumber
 *               - iceMachines
 *             properties:
 *               name:
 *                 type: string
 *                 description: 매장명
 *                 example: "테호의 제빙 매장"
 *               mainAddress:
 *                 type: string
 *                 description: 기본 주소
 *                 example: "서울특별시 강남구 테호동"
 *               detailedAddress:
 *                 type: string
 *                 nullable: true
 *                 description: 상세 주소
 *                 example: "123-456호"
 *               managerName:
 *                 type: string
 *                 nullable: true
 *                 description: 담당자 이름
 *                 example: "김테호"
 *               phoneNumber:
 *                 type: string
 *                 description: 업체 연락처
 *                 example: "010-1234-5678"
 *               iceMachines:
 *                 type: array
 *                 description: 등록할 제빙기 목록
 *                 items:
 *                   type: object
 *                   properties:
 *                     brand:
 *                       type: string
 *                       example: "삼성"
 *                     model:
 *                       type: string
 *                       example: "ICE-2000"
 *                     size:
 *                       type: string
 *                       example: "대형"
 *     responses:
 *       200:
 *         description: 매장 및 제빙기 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                 payload:
 *                   type: object
 *                   properties:
 *                     newBusiness:
 *                       type: object
 *                     iceMachines:
 *                       type: array
 *       401:
 *         description: 인증 실패
 */
router.post("/", authMiddleware, businessesController.registerBusiness);

/**
 * @swagger
 * /api/businesses:
 *   get:
 *     summary: 사용자 소유 매장 목록 조회
 *     tags: [Businesses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 매장 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                 payload:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       mainAddress:
 *                         type: string
 *                       # ... etc (Business model fields)
 *       401:
 *         description: 인증 실패
 */
router.get('/', authMiddleware, businessesController.getBusinesses);

/**
 * @swagger
 * /api/businesses/{businessId}:
 *   get:
 *     summary: 특정 매장 정보 조회
 *     tags: [Businesses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 조회할 매장의 ID
 *     responses:
 *       200:
 *         description: 매장 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                 payload:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     # ... etc (Business model fields)
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 해당 매장에 대한 접근 권한 없음
 *       404:
 *         description: 매장을 찾을 수 없음
 *   put:
 *     summary: 매장 정보 업데이트
 *     tags: [Businesses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 업데이트할 매장의 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 매장명
 *               mainAddress:
 *                 type: string
 *                 description: 기본 주소
 *               detailedAddress:
 *                 type: string
 *                 nullable: true
 *                 description: 상세 주소
 *               managerName:
 *                 type: string
 *                 nullable: true
 *                 description: 담당자 이름
 *               phoneNumber:
 *                 type: string
 *                 description: 업체 연락처
 *     responses:
 *       200:
 *         description: 매장 정보 업데이트 성공
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 해당 매장에 대한 수정 권한 없음
 *       404:
 *         description: 매장을 찾을 수 없음
 *   delete:
 *     summary: 매장 삭제
 *     tags: [Businesses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 삭제할 매장의 ID
 *     responses:
 *       200:
 *         description: 매장 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                 payload:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "매장이 성공적으로 삭제되었습니다."
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 해당 매장에 대한 삭제 권한 없음
 *       404:
 *         description: 매장을 찾을 수 없음
 */
router.get('/', authMiddleware, businessesController.getBusinesses);
router.get('/:businessId', authMiddleware, businessesController.getBusiness);
router.put('/:businessId', authMiddleware, businessesController.updateBusiness);
router.delete('/:businessId', authMiddleware, businessesController.deleteBusiness);


export default router;
