

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: 대시보드 통계 조회
 *     tags: [Admin-Reservations]
 *     security:
 *       - bearerAuth: []
 *     description: 관리자 대시보드에 필요한 예약 상태별 통계를 조회합니다.
 *     responses:
 *       200:
 *         description: 통계 조회 성공.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalReservations:
 *                       type: integer
 *                     pendingCount:
 *                       type: integer
 *                     confirmedCount:
 *                       type: integer
 *                     doneCount:
 *                       type: integer
 *                     canceledCount:
 *                       type: integer
 *               example:
 *                 status: 200
 *                 message: "성공"
 *                 data:
 *                   totalReservations: 100
 *                   pendingCount: 20
 *                   confirmedCount: 30
 *                   doneCount: 45
 *                   canceledCount: 5
 *
 */

/**
 * @swagger
 * /api/admin/reservations:
 *   get:
 *     summary: 전체 예약 목록 조회
 *     tags: [Admin-Reservations]
 *     security:
 *       - bearerAuth: []
 *     description: 페이지네이션 및 필터링을 통해 전체 예약 목록을 조회합니다.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이지 당 항목 수
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, DONE, CANCELED]
 *         description: 예약 상태 필터
 *       - in: query
 *         name: userName
 *         schema:
 *           type: string
 *         description: 사용자 이름 필터
 *       - in: query
 *         name: engineerName
 *         schema:
 *           type: string
 *         description: 엔지니어 이름 필터
 *     responses:
 *       200:
 *         description: 예약 목록 조회 성공.
 */

/**
 * @swagger
 * /api/admin/reservations/{id}:
 *   get:
 *     summary: 예약 상세 정보 조회
 *     tags: [Admin-Reservations]
 *     security:
 *       - bearerAuth: []
 *     description: 특정 예약 건의 상세 정보를 조회합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 예약의 고유 ID
 *     responses:
 *       200:
 *         description: 예약 상세 정보 조회 성공.
 *       404:
 *         description: 해당 ID의 예약을 찾을 수 없을 경우.
 */

/**
 * @swagger
 * /api/admin/reservations/{id}/status:
 *   patch:
 *     summary: 예약 상태 강제 업데이트
 *     tags: [Admin-Reservations]
 *     security:
 *       - bearerAuth: []
 *     description: 관리자가 특정 예약의 상태를 강제로 변경합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 예약의 고유 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, DONE, CANCELED]
 *                 example: "CONFIRMED"
 *     responses:
 *       200:
 *         description: 예약 상태 업데이트 성공.
 *       400:
 *         description: 잘못된 상태 값을 보냈을 경우.
 *       404:
 *         description: 해당 ID의 예약을 찾을 수 없을 경우.
 */
