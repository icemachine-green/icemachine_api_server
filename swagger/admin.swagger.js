

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: 관리자 로그인
 *     tags: [Admin]
 *     description: 관리자 계정으로 로그인하여 accessToken을 발급받습니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: "superadmin"
 *               password:
 *                 type: string
 *                 example: "superadmin123"
 *     responses:
 *       200:
 *         description: 로그인 성공. accessToken과 함께 refreshToken이 HttpOnly 쿠키로 설정됩니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: 아이디 또는 비밀번호가 일치하지 않거나 비활성화된 계정일 경우.
 */

/**
 * @swagger
 * /api/admin/reissue:
 *   post:
 *     summary: 관리자 액세스 토큰 재발급 (Silent Refresh)
 *     tags: [Admin]
 *     description: httpOnly 쿠키에 담긴 refreshToken을 사용하여 새로운 accessToken을 발급받습니다. 헤더에 토큰을 담지 않습니다.
 *     responses:
 *       200:
 *         description: 토큰 재발급 성공.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: 쿠키에 유효한 refreshToken이 없거나 만료되었을 경우.
 */

/**
 * @swagger
 * /api/admin/accounts:
 *   post:
 *     summary: 신규 관리자 계정 생성 (SUPER_ADMIN 전용)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: SUPER_ADMIN 권한으로 새로운 ADMIN 계정을 생성합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, name]
 *             properties:
 *               username:
 *                 type: string
 *                 example: "newadmin"
 *               password:
 *                 type: string
 *                 example: "newpassword123"
 *               name:
 *                 type: string
 *                 example: "새 관리자"
 *               role:
 *                 type: string
 *                 example: "ADMIN"
 *                 description: "입력하지 않으면 기본값 'ADMIN'으로 설정됩니다."
 *     responses:
 *       200:
 *         description: 계정 생성 성공.
 *       403:
 *         description: SUPER_ADMIN 권한이 없을 경우.
 *       409:
 *         description: 이미 존재하는 사용자 이름일 경우.
 */

/**
 * @swagger
 * /api/admin/notifications:
 *   get:
 *     summary: 알림 목록 조회
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: 숨김 처리되지 않은 알림 목록을 페이지네이션으로 조회합니다.
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
 *     responses:
 *       200:
 *         description: 조회 성공.
 */

/**
 * @swagger
 * /api/admin/notifications/{id}/read:
 *   patch:
 *     summary: 알림 읽음 처리
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: "특정 알림을 읽음 상태(isRead: true)로 변경합니다."
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 알림의 고유 ID
 *     responses:
 *       200:
 *         description: 읽음 처리 성공.
 *       404:
 *         description: 해당 ID의 알림을 찾을 수 없을 경우.
 */

/**
 * @swagger
 * /api/admin/notifications/{id}/work:
 *   patch:
 *     summary: 알림 업무 상태/메모 수정
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: 특정 알림의 업무 처리 상태(status)나 관리자 메모(adminMemo)를 수정합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 알림의 고유 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, DONE]
 *                 example: "DONE"
 *               adminMemo:
 *                 type: string
 *                 example: "고객 문의 처리 완료됨."
 *     responses:
 *       200:
 *         description: 수정 성공.
 *       404:
 *         description: 해당 ID의 알림을 찾을 수 없을 경우.
 */

/**
 * @swagger
 * /api/admin/notifications/{id}/hide:
 *   patch:
 *     summary: 알림 숨기기
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: "특정 알림을 목록에서 보이지 않도록 숨김 처리(isHidden: true)합니다."
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 알림의 고유 ID
 *     responses:
 *       200:
 *         description: 숨김 처리 성공.
 *       404:
 *         description: 해당 ID의 알림을 찾을 수 없을 경우.
 */
