/**
 * @file swagger/auth.swagger.js
 * @description Auth API Swagger 정의
 * 251230 v1.0.0 Taeho Lee init
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 인증 (로그인/회원가입, 토큰) 관련 API
 */

/**
 * @swagger
 * /api/auth/kakao/authorize:
 *   get:
 *     summary: 카카오 로그인 시작
 *     tags: [Auth]
 *     description: 사용자를 카카오 인증 페이지로 리다이렉트시킵니다. API 테스트보다는 브라우저 주소창에 직접 입력하여 사용합니다.
 *     responses:
 *       302:
 *         description: 카카오 인증 페이지로 리다이렉트됩니다.
 */

/**
 * @swagger
 * /api/auth/kakao/callback:
 *   get:
 *     summary: 카카오 로그인 콜백 (내부용)
 *     tags: [Auth]
 *     description: 카카오 인증 후, 백엔드가 사용자를 처리하기 위해 사용하는 내부 콜백 경로입니다. 사용자가 직접 호출하지 않습니다.
 *     responses:
 *       302:
 *         description: 로그인 성공 시 메인 페이지, 신규 가입 시 추가 정보 입력 페이지로 리다이렉트됩니다.
 */

/**
 * @swagger
 * /api/auth/social-signup:
 *   post:
 *     summary: 소셜 회원가입 (추가 정보 입력)
 *     tags: [Auth]
 *     description: 신규 소셜 로그인 사용자가 추가 정보를 제출하는 API입니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               socialId:
 *                 type: string
 *               provider:
 *                 type: string
 *               name:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       302:
 *         description: 회원가입 성공 시 사업자 등록 페이지로 리다이렉트됩니다.
 *       409:
 *         description: 이미 존재하는 이메일일 경우 Conflict 에러가 발생합니다.
 */

/**
 * @swagger
 * /api/auth/reissue:
 *   post:
 *     summary: 액세스 토큰 재발급 (Silent Refresh)
 *     tags: [Auth]
 *     description: "httpOnly 쿠키에 담긴 refreshToken을 사용하여 새로운 accessToken을 발급받습니다. 프론트엔드는 앱 로딩 시 이 API를 호출하여 로그인 상태를 유지해야 합니다. 요청 시 쿠키가 자동으로 전송되므로 별도의 요청 본문은 필요 없습니다."
 *     responses:
 *       200:
 *         description: 토큰 재발급 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 payload:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     user:
 *                       type: object
 *       401:
 *         description: 쿠키에 유효한 refreshToken이 없거나 만료되었을 경우 인증 에러가 발생합니다.
 */
