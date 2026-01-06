import db from '../models/index.js';
import { Op } from 'sequelize';

const AdminNotification = db.AdminNotification;
const Reservation = db.Reservation;
const User = db.User;

const AdminNotificationRepository = {
    /**
     * 숨김 처리되지 않은 모든 알림을 페이지네이션으로 조회합니다.
     * @param {number} offset - 페이지 오프셋
     * @param {number} limit - 페이지 당 항목 수
     * @returns {Promise<{count: number, rows: AdminNotification[]}>}
     */
    findAll: async (offset = 0, limit = 10) => {
        return await AdminNotification.findAndCountAll({
            where: { isHidden: false },
            include: [{
                model: Reservation,
                attributes: ['id', 'status', 'reservedDate'],
                include: [{
                    model: User,
                    attributes: ['name', 'phoneNumber']
                }]
            }],
            offset,
            limit,
            order: [['createdAt', 'DESC']],
            distinct: true, // count가 정확히 계산되도록 보장
        });
    },

    /**
     * ID로 특정 알림을 업데이트합니다.
     * @param {number} id - 알림 ID
     * @param {object} updateData - 업데이트할 데이터 (e.g., { isRead: true })
     * @returns {Promise<boolean>} - 업데이트 성공 여부
     */
    update: async (id, updateData) => {
        const [updatedRows] = await AdminNotification.update(updateData, {
            where: { id, isHidden: false } // 숨겨진 항목은 수정 불가
        });
        return updatedRows > 0;
    },

    /**
     * ID로 특정 알림을 숨김 처리(소프트 삭제)합니다.
     * @param {number} id - 알림 ID
     * @returns {Promise<boolean>} - 숨김 처리 성공 여부
     */
    hide: async (id) => {
        const [updatedRows] = await AdminNotification.update(
            { isHidden: true },
            { where: { id } }
        );
        return updatedRows > 0;
    }
};

export default AdminNotificationRepository;
