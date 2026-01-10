/**
 * @file app/services/reservation.admin.service.js
 */
import reservationAdminRepository from "../repositories/reservation.admin.repository.js";
import myError from "../errors/customs/my.error.js";
import {
  NOT_FOUND_ERROR,
  BAD_REQUEST_ERROR,
  DB_ERROR,
} from "../../configs/responseCode.config.js";
import { buildPaginatedResponse } from "../utils/pagination.util.js";

// DTO 가공 로직 (안전한 참조를 위해 데이터 존재 여부 체크 보강)
const _toReservationListDTO = (reservation) => {
  if (!reservation) return null;

  // Sequelize 인스턴스일 경우를 대비해 toJSON 처리 (혹은 일반 객체)
  const res = reservation.toJSON ? reservation.toJSON() : reservation;

  return {
    id: res.id,
    reservedDate: res.reservedDate,
    serviceStartTime: res.serviceStartTime,
    serviceEndTime: res.serviceEndTime,
    status: res.status,
    createdAt: res.createdAt,
    user: res.User
      ? { name: res.User.name, phoneNumber: res.User.phoneNumber }
      : null,
    business: res.Business
      ? {
          name: res.Business.name,
          address: `${res.Business.mainAddress || ""} ${
            res.Business.detailedAddress || ""
          }`.trim(),
          phoneNumber: res.Business.phoneNumber,
        }
      : null,
    engineer: res.Engineer?.User
      ? {
          name: res.Engineer.User.name,
          phoneNumber: res.Engineer.User.phoneNumber,
        }
      : null,
    iceMachine: res.IceMachine
      ? {
          brandName: res.IceMachine.brandName,
          modelName: res.IceMachine.modelName,
          sizeType: res.IceMachine.sizeType,
        }
      : null,
    servicePolicy: res.ServicePolicy
      ? { serviceType: res.ServicePolicy.serviceType }
      : null,
  };
};

const reservationAdminService = {
  getDashboardStats: async (startDate) => {
    try {
      const stats = await reservationAdminRepository.getReservationStats(
        startDate
      );
      const initialStats = {
        PENDING: 0,
        CONFIRMED: 0,
        START: 0,
        COMPLETED: 0,
        CANCELED: 0,
      };

      stats.forEach((stat) => {
        if (Object.prototype.hasOwnProperty.call(initialStats, stat.status)) {
          initialStats[stat.status] = parseInt(stat.count, 10);
        }
      });
      return initialStats;
    } catch (error) {
      throw myError("대시보드 통계 조회 중 오류가 발생했습니다.", DB_ERROR);
    }
  },

  getReservations: async (page, limit, filters) => {
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (safePage - 1) * safeLimit;

    try {
      const { count, rows } =
        await reservationAdminRepository.findAllReservations({
          offset,
          limit: safeLimit,
          ...filters,
        });

      const processedRows = rows.map(_toReservationListDTO);
      return buildPaginatedResponse(safePage, safeLimit, count, processedRows);
    } catch (error) {
      throw myError(
        "예약 목록을 가져오는 중 데이터베이스 오류가 발생했습니다.",
        DB_ERROR
      );
    }
  },

  getReservationDetail: async (id) => {
    if (!id) throw myError("예약 ID가 필요합니다.", BAD_REQUEST_ERROR);

    try {
      // 🚩 Repository에 추가된 findReservationDetail 호출
      const reservation =
        await reservationAdminRepository.findReservationDetail(id);

      if (!reservation) {
        throw myError(
          "요청하신 예약 정보를 찾을 수 없습니다.",
          NOT_FOUND_ERROR
        );
      }

      // 🚩 핵심: 상세 정보도 프론트가 인식할 수 있게 DTO 가공 로직을 태워야 함
      return _toReservationListDTO(reservation);
    } catch (error) {
      if (error.status) throw error;
      throw myError("상세 정보 조회 중 서버 오류가 발생했습니다.", DB_ERROR);
    }
  },

  updateReservationStatus: async (id, status) => {
    if (!id || !status)
      throw myError("ID와 상태값은 필수 입력 사항입니다.", BAD_REQUEST_ERROR);

    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "START",
      "COMPLETED",
      "CANCELED",
    ];
    if (!validStatuses.includes(status))
      throw myError("유효하지 않은 예약 상태입니다.", BAD_REQUEST_ERROR);

    try {
      const isUpdated =
        await reservationAdminRepository.updateReservationStatus(id, status);
      if (!isUpdated)
        throw myError(
          "상태를 업데이트할 대상을 찾을 수 없습니다.",
          NOT_FOUND_ERROR
        );
      return true;
    } catch (error) {
      if (error.status) throw error;
      throw myError(
        "예약 상태 수정 중 데이터베이스 오류가 발생했습니다.",
        DB_ERROR
      );
    }
  },
};

export default reservationAdminService;
