/**
 * @file app/services/admin.notification.service.js
 */
import AdminNotificationRepository from "../repositories/admin.notification.repository.js";
import { buildPaginatedResponse } from "../utils/pagination.util.js";
import myError from "../errors/customs/my.error.js";
import {
  NOT_FOUND_ERROR,
  BAD_REQUEST_ERROR,
  DB_ERROR,
} from "../../configs/responseCode.config.js";

const adminNotificationService = {
  /**
   * 페이지네이션을 적용하여 알림 목록을 조회합니다.
   */
  getNotifications: async (page, limit) => {
    const offset = (page - 1) * limit;

    try {
      const { count, rows } = await AdminNotificationRepository.findAll(
        offset,
        limit
      );

      // 기존 데이터 가공 로직 유지
      const processedRows = rows.map((notification) => {
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
            user: notification.Reservation.User || null,
          };
        }
        return result;
      });

      return buildPaginatedResponse(page, limit, count, processedRows);
    } catch (error) {
      throw myError("알림 목록 조회 중 오류가 발생했습니다.", DB_ERROR);
    }
  },

  /**
   * 알림을 읽음 처리합니다.
   */
  markAsRead: async (id) => {
    try {
      const updated = await AdminNotificationRepository.update(id, {
        isRead: true,
      });
      if (!updated) {
        throw myError(
          "알림을 찾을 수 없거나 업데이트에 실패했습니다.",
          NOT_FOUND_ERROR
        );
      }
    } catch (error) {
      if (error.status) throw error;
      throw myError(
        "알림 읽음 처리 중 데이터베이스 오류가 발생했습니다.",
        DB_ERROR
      );
    }
  },

  /**
   * 알림의 업무 상태를 변경합니다.
   */
  updateWorkStatus: async (id, workData) => {
    // 기존 status 값 유효성 검사 로직 유지
    if (workData.status && !["PENDING", "DONE"].includes(workData.status)) {
      throw myError("유효하지 않은 상태 값입니다.", BAD_REQUEST_ERROR);
    }

    try {
      const updated = await AdminNotificationRepository.update(id, workData);
      if (!updated) {
        throw myError(
          "알림을 찾을 수 없거나 업데이트에 실패했습니다.",
          NOT_FOUND_ERROR
        );
      }
    } catch (error) {
      if (error.status) throw error;
      throw myError(
        "업무 상태 변경 중 데이터베이스 오류가 발생했습니다.",
        DB_ERROR
      );
    }
  },

  /**
   * 알림을 숨김 처리합니다.
   */
  hideNotification: async (id) => {
    try {
      const hidden = await AdminNotificationRepository.hide(id);
      if (!hidden) {
        throw myError(
          "알림을 찾을 수 없거나 숨김 처리에 실패했습니다.",
          NOT_FOUND_ERROR
        );
      }
    } catch (error) {
      if (error.status) throw error;
      throw myError(
        "알림 숨김 처리 중 데이터베이스 오류가 발생했습니다.",
        DB_ERROR
      );
    }
  },
};

export default adminNotificationService;
