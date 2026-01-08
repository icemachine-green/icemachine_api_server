/**
 * @file swagger/reservations.swagger.js
 * @description Reservations API Swagger 정의
 * @date 2026-01-02
 */

/**
 * @swagger
 * /api/reservations:
 *   post:
 *     summary: 예약 생성 및 기사 자동 배정
 *     tags: [Reservations]
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
 *               - iceMachineId
 *               - servicePolicyId
 *               - reservedDate
 *               - serviceStartTime
 *             properties:
 *               businessId:
 *                 type: integer
 *                 description: 매장 ID
 *                 example: 1
 *               iceMachineId:
 *                 type: integer
 *                 description: 제빙기 ID
 *                 example: 1
 *               servicePolicyId:
 *                 type: integer
 *                 description: 서비스 정책 ID
 *                 example: 1
 *               reservedDate:
 *                 type: string
 *                 format: date
 *                 description: "예약 날짜 (YYYY-MM-DD)"
 *                 example: "2026-01-20"
 *               serviceStartTime:
 *                 type: string
 *                 description: "예약 시작 시간 (HH:mm:ss)"
 *                 example: "14:00:00"
 *               note:
 *                 type: string
 *                 nullable: true
 *                 description: "예약 관련 참고사항"
 *                 example: "주차 공간이 협소합니다."
 *     responses:
 *       200:
 *         description: 예약 생성 성공
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
 *                   description: "생성된 예약 상세 정보"
 *                   properties:
 *                     id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       example: "CONFIRMED"
 *                     engineerId:
 *                       type: integer
 *       400:
 *         description: 잘못된 요청 (필수 정보 누락)
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 관련 리소스(매장, 제빙기 등)를 찾을 수 없음
 *       409:
 *         description: 충돌 (본인 매장이 아니거나, 배정 가능한 기사가 없음)
 */

/**
 * @swagger
 * /api/reservations/availability:
 *   get:
 *     summary: 예약 가능 날짜 및 시간 조회
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: "조회 시작 날짜 (YYYY-MM-DD)"
 *         example: "2026-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: "조회 종료 날짜 (YYYY-MM-DD)"
 *         example: "2026-02-28"
 *       - in: query
 *         name: servicePolicyId
 *         schema:
 *           type: integer
 *         required: true
 *         description: "서비스 정책 ID"
 *         example: 1
 *     responses:
 *       200:
 *         description: 예약 불가능한 시간 슬롯 목록 조회 성공
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
 *                     range:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date
 *                           example: "2026-01-01"
 *                         end:
 *                           type: string
 *                           format: date
 *                           example: "2026-02-28"
 *                     disabled:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                             example: "2026-01-05"
 *                           time:
 *                             type: string
 *                             example: "14:00"
 *                           reason:
 *                             type: string
 *                             enum: [NO_ENGINEER_AVAILABLE, FULLY_BOOKED]
 *                             example: "FULLY_BOOKED"
 *       400:
 *         description: 잘못된 요청 (파라미터 누락, 조회 기간 2개월 초과 등)
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 서비스 정책을 찾을 수 없음
 */

/**
 * @swagger
 * /api/reservations/by-user/{userId}:
 *   get:
 *     summary: 사용자 소유 예약 목록 조회
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: "예약 목록을 조회할 사용자의 ID"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, START, COMPLETED, CANCELED]
 *         required: false
 *         description: "필터링할 예약 상태"
 *     responses:
 *       200:
 *         description: 예약 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 msg:
 *                   type: string
 *                   example: "정상 처리"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 101
 *                       businessId:
 *                         type: integer
 *                         example: 1
 *                       iceMachineId:
 *                         type: integer
 *                         example: 1
 *                       servicePolicyId:
 *                         type: integer
 *                         example: 1
 *                       reservedDate:
 *                         type: string
 *                         format: date
 *                         example: "2026-01-20"
 *                       serviceWindow:
 *                         type: string
 *                         example: "14:00 ~ 15:00"
 *                       status:
 *                         type: string
 *                         example: "CONFIRMED"
 *                       engineerName:
 *                         type: string
 *                         example: "김기사"
 *                       engineerPhone:
 *                         type: string
 *                         example: "010-1234-5678"
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 접근 권한 없음 (자신의 예약만 조회 가능)
 */

/**
 * @swagger
 * /api/reservations/cancel/{reservationId}:
 *   patch:
 *     summary: 예약 취소
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         schema:
 *           type: integer
 *         required: true
 *         description: "취소할 예약의 ID"
 *     responses:
 *       200:
 *         description: 예약 취소 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 msg:
 *                   type: string
 *                   example: "정상 처리"
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "예약이 성공적으로 취소되었습니다."
 *       400:
 *         description: 잘못된 요청 (이미 취소할 수 없는 상태)
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 접근 권한 없음 (자신의 예약만 취소 가능)
 *       404:
 *         description: 예약을 찾을 수 없음
 *       409:
 *         description: 충돌 (서비스 24시간 전 취소 불가 등 정책 위반)
 */
