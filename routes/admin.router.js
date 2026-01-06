import express from 'express';
import AdminNotificationController from '../app/controllers/AdminNotificationController.js';
import AdminController from '../app/controllers/AdminController.js';
import authAdminMiddleware from '../app/middlewares/auth/auth.admin.middleware.js';
import verifyRole from '../app/middlewares/auth/verifyRole.js';

const router = express.Router();

// NOTE: 모든 /admin 경로에 관리자 인증 미들웨어 적용 (추후 활성화)
// router.use(authAdminMiddleware); // 이 미들웨어를 전역적으로 사용하지 않으므로 각 라우트에 개별 적용

// API for AdminNotification
router.get('/notifications', authAdminMiddleware, AdminNotificationController.getNotifications);
router.patch('/notifications/:id/read', authAdminMiddleware, AdminNotificationController.markAsRead);
router.patch('/notifications/:id/work', authAdminMiddleware, AdminNotificationController.updateWorkStatus);
router.patch('/notifications/:id/hide', authAdminMiddleware, AdminNotificationController.hideNotification);

// API for Admin Account Management
router.post('/accounts', authAdminMiddleware, verifyRole(['SUPER_ADMIN']), AdminController.createAdminAccount);

// API for Admin Login
router.post('/login', AdminController.loginAdmin);
router.post('/reissue', AdminController.reissue);

export default router;
