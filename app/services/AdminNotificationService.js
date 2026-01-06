import AdminNotificationRepository from '../repositories/AdminNotificationRepository.js';
import { buildPaginatedResponse } from '../utils/pagination.util.js'; // 페이지네이션 유틸 (추후 생성 필요)

const AdminNotificationService = {
    /**
     * 페이지네이션을 적용하여 알림 목록을 조회합니다.
     * @param {number} page - 현재 페이지 번호
     * @param {number} limit - 페이지 당 항목 수
     */
    getNotifications: async (page, limit) => {
        const offset = (page - 1) * limit;
        const { count, rows } = await AdminNotificationRepository.findAll(offset, limit);

        // 데이터 가공
        const processedRows = rows.map(notification => {
            const result = {
                id: notification.id,
                type: notification.type,
                message: notification.message,
                isRead: notification.isRead,
                isTodo: notification.isTodo,
                status: notification.status,
                createdAt: notification.createdAt,
            };
            if (notification.Reservation) {
                result.reservation = {
                    id: notification.Reservation.id,
                    status: notification.Reservation.status,
                    reservedDate: notification.Reservation.reservedDate,
                    user: notification.Reservation.User || null
                };
            }
            return result;
        });
        
        // 페이지네이션 응답 형태로 만듦 (유틸 함수 사용)
        return buildPaginatedResponse(page, limit, count, processedRows);
    },

    /**
     * 알림을 읽음 처리합니다.
     * @param {number} id - 알림 ID
     */
    markAsRead: async (id) => {
        const updated = await AdminNotificationRepository.update(id, { isRead: true });
        if (!updated) {
            throw new Error('알림을 찾을 수 없거나 업데이트에 실패했습니다.');
        }
    },

    /**
     * 알림의 업무 상태를 변경합니다.
     * @param {number} id - 알림 ID
     * @param {object} workData - { status, adminMemo }
     */
    updateWorkStatus: async (id, workData) => {
        // status 값 유효성 검사
        if (workData.status && !['PENDING', 'DONE'].includes(workData.status)) {
            throw new Error('유효하지 않은 상태 값입니다.');
        }

        const updated = await AdminNotificationRepository.update(id, workData);
        if (!updated) {
            throw new Error('알림을 찾을 수 없거나 업데이트에 실패했습니다.');
        }
    },

    /**
     * 알림을 숨김 처리합니다.
     * @param {number} id - 알림 ID
     */
    hideNotification: async (id) => {
        const hidden = await AdminNotificationRepository.hide(id);
        if (!hidden) {
            throw new Error('알림을 찾을 수 없거나 숨김 처리에 실패했습니다.');
        }
    }
};



export default AdminNotificationService;
