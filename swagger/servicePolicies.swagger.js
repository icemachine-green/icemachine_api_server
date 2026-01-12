/**
 * @file swagger/servicePolicies.swagger.js
 * @description Service Policies API Swagger 정의
 */

/**
 * @swagger
 * /api/servicePolicies:
 *   get:
 *     summary: 모든 서비스 정책 조회
 *     tags: [ServicePolicies]
 *     responses:
 *       200:
 *         description: 모든 서비스 정책 조회 성공
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
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       price:
 *                         type: integer
 *                       duration:
 *                         type: integer
 *                       description:
 *                         type: string
 */
