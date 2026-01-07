import adminNotificationService from '../services/admin.notification.service.js';
import { createBaseResponse } from '../utils/createBaseResponse.util.js';
import { SUCCESS } from '../../configs/responseCode.config.js';

const adminNotificationController = {
    /**
     * GET /admin/notifications
     * 알림 목록을 페이지네이션으로 조회합니다.
     */
    getNotifications: async (req, res, next) => {
        try {
            const page = parseInt(req.query.page || 1, 10);
            const limit = parseInt(req.query.limit || 10, 10);

            const result = await adminNotificationService.getNotifications(page, limit);
            
            return res.status(SUCCESS.status).send(createBaseResponse(SUCCESS, result));
        } catch (error) {
            next(error);
        }
    },

    /**
     * PATCH /admin/notifications/:id/read
     * 알림을 읽음 처리합니다.
     */
    markAsRead: async (req, res, next) => {
        try {
            const { id } = req.params;
            await adminNotificationService.markAsRead(id);
            return res.status(SUCCESS.status).send(createBaseResponse(SUCCESS, null, "읽음 처리되었습니다."));
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * PATCH /admin/notifications/:id/work
     * 알림의 업무 상태를 변경합니다.
     */
    updateWorkStatus: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { status, adminMemo } = req.body;
            await adminNotificationService.updateWorkStatus(id, { status, adminMemo });
            return res.status(SUCCESS.status).send(createBaseResponse(SUCCESS, null, "업무 상태가 변경되었습니다."));
        } catch (error) {
            next(error);
        }
    },

    /**
     * PATCH /admin/notifications/:id/hide
     * 알림을 숨김 처리합니다.
     */
    hideNotification: async (req, res, next) => {
        try {
            const { id } = req.params;
            await adminNotificationService.hideNotification(id);
            return res.status(SUCCESS.status).send(createBaseResponse(SUCCESS, null, "알림이 숨김 처리되었습니다."));
        } catch (error) {
            next(error);
        }
    }
};

export default adminNotificationController;
