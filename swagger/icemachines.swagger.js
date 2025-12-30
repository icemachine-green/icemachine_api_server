/**
 * @file swagger/icemachines.swagger.js
 * @description Ice Machines API Swagger 정의
 * 251230 v1.0.0 Taeho Lee init
 */

/**
 * @swagger
 * tags:
 *   name: IceMachines
 *   description: 제빙기 관련 API (사업장에 속한 제빙기 관리)
 */

/**
 * @swagger
 * /api/icemachines:
 *   get:
 *     summary: 특정 사업장의 제빙기 목록 조회
 *     tags: [IceMachines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: businessId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 제빙기 목록을 조회할 사업장의 ID
 *     responses:
 *       200:
 *         description: 제빙기 목록 조회 성공
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
 *                       businessId:
 *                         type: integer
 *                       modelType:
 *                         type: string
 *                       sizeType:
 *                         type: string
 *                       modelName:
 *                         type: string
 *       400:
 *         description: businessId 쿼리 파라미터가 누락됨
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 해당 매장의 제빙기 정보에 접근할 권한이 없음
 *       404:
 *         description: 매장을 찾을 수 없음
 */

/**
 * @swagger
 * /api/icemachines:
 *   post:
 *     summary: 기존 사업장에 새 제빙기 추가
 *     tags: [IceMachines]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessId
 *             properties:
 *               businessId:
 *                 type: integer
 *                 description: 제빙기를 추가할 사업장의 ID
 *               brand:
 *                 type: string
 *                 example: "브랜드"
 *               model:
 *                 type: string
 *                 example: "모델명"
 *               size:
 *                 type: string
 *                 example: "중형"
 *     responses:
 *       200:
 *         description: 제빙기 추가 성공
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
 *                     businessId:
 *                       type: integer
 *                     modelName:
 *                       type: string
 *       400:
 *         description: 요청 본문에 businessId가 누락됨
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 해당 매장에 제빙기를 추가할 권한이 없음
 *       404:
 *         description: 매장을 찾을 수 없음
 */

/**
 * @swagger
 * /api/icemachines/{iceMachineId}:
 *   put:
 *     summary: 특정 제빙기 정보 수정
 *     tags: [IceMachines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: iceMachineId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 수정할 제빙기의 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               size:
 *                 type: string
 *     responses:
 *       200:
 *         description: 제빙기 정보 수정 성공
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 해당 제빙기를 수정할 권한이 없음
 *       404:
 *         description: 제빙기 또는 연결된 사업장을 찾을 수 없음
 */
/**
 * @swagger
 * /api/icemachines/{iceMachineId}:
 *   delete:
 *     summary: 특정 제빙기 삭제
 *     tags: [IceMachines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: iceMachineId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 삭제할 제빙기의 ID
 *     responses:
 *       200:
 *         description: 제빙기 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "제빙기가 성공적으로 삭제되었습니다."
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 해당 제빙기를 삭제할 권한이 없음
 *       404:
 *         description: 제빙기를 찾을 수 없음
 */
