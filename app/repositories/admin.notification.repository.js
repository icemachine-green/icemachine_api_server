/**
 * @file app/repositories/admin.notification.repository.js
 */
import db from "../models/index.js";

const AdminNotification = db.AdminNotification;
const Reservation = db.Reservation;
const User = db.User;

const adminNotificationRepository = {
  /**
   * 숨김 처리되지 않은 모든 알림을 페이지네이션으로 조회합니다.
   */
  findAll: async (offset = 0, limit = 10) => {
    // 기존 쿼리 로직 100% 유지 (try-catch 제거)
    return await AdminNotification.findAndCountAll({
      where: { isHidden: false },
      include: [
        {
          model: Reservation,
          attributes: ["id", "status", "reservedDate"],
          include: [
            {
              model: User,
              attributes: ["name", "phoneNumber"],
            },
          ],
        },
      ],
      offset,
      limit,
      order: [["createdAt", "DESC"]],
      distinct: true,
    });
  },

  /**
   * ID로 특정 알림을 업데이트합니다.
   */
  update: async (id, updateData) => {
    const [updatedRows] = await AdminNotification.update(updateData, {
      where: { id, isHidden: false },
    });
    return updatedRows > 0;
  },

  /**
   * ID로 특정 알림을 숨김 처리(소프트 삭제)합니다.
   */
  hide: async (id) => {
    const [updatedRows] = await AdminNotification.update(
      { isHidden: true },
      { where: { id } }
    );
    return updatedRows > 0;
  },
};

export default adminNotificationRepository;
