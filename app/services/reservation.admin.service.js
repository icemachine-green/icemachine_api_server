import reservationAdminRepository from "../repositories/reservation.admin.repository.js";
import myError from "../errors/customs/my.error.js";
import {
  NOT_FOUND_ERROR,
  BAD_REQUEST_ERROR,
} from "../../configs/responseCode.config.js";
import { buildPaginatedResponse } from "../utils/pagination.util.js";

/**
 * [Internal DTO] 목록 조회 시 클라이언트 응답 규격 가공
 */
const _toReservationListDTO = (reservation) => ({
  id: reservation.id,
  reservedDate: reservation.reservedDate,
  serviceStartTime: reservation.serviceStartTime,
  serviceEndTime: reservation.serviceEndTime,
  status: reservation.status,
  createdAt: reservation.createdAt,
  user: reservation.User
    ? {
        name: reservation.User.name,
        phoneNumber: reservation.User.phoneNumber,
      }
    : null,
  business: reservation.Business
    ? {
        name: reservation.Business.name,
        address: `${reservation.Business.mainAddress} ${reservation.Business.detailedAddress}`,
        phoneNumber: reservation.Business.phoneNumber,
      }
    : null,
  engineer:
    reservation.Engineer && reservation.Engineer.User
      ? {
          name: reservation.Engineer.User.name,
          phoneNumber: reservation.Engineer.User.phoneNumber,
        }
      : null,
  iceMachine: reservation.IceMachine
    ? {
        modelName: reservation.IceMachine.modelName,
        modelType: reservation.IceMachine.modelType,
        sizeType: reservation.IceMachine.sizeType,
      }
    : null,
  servicePolicy: reservation.ServicePolicy
    ? {
        serviceType: reservation.ServicePolicy.serviceType,
      }
    : null,
});

const reservationAdminService = {
  getDashboardStats: async () => {
    const stats = await reservationAdminRepository.getReservationStats();
    const initialStats = {
      PENDING: 0,
      CONFIRMED: 0,
      START: 0,
      COMPLETED: 0,
      CANCELED: 0,
    };
    stats.forEach((stat) => {
      initialStats[stat.status] = stat.count;
    });
    return initialStats;
  },

  getReservations: async (page, limit, filters) => {
    const offset = (page - 1) * limit;
    const { count, rows } =
      await reservationAdminRepository.findAllReservations({
        offset,
        limit,
        ...filters,
      });

    const processedRows = rows.map(_toReservationListDTO);
    return buildPaginatedResponse(page, limit, count, processedRows);
  },

  getReservationDetail: async (id) => {
    const reservation = await reservationAdminRepository.findReservationDetail(
      id
    );
    if (!reservation) {
      throw myError("예약을 찾을 수 없습니다.", NOT_FOUND_ERROR);
    }
    return reservation;
  },

  updateReservationStatus: async (id, status) => {
    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "START",
      "COMPLETED",
      "CANCELED",
    ];
    if (!validStatuses.includes(status)) {
      throw myError("유효하지 않은 예약 상태입니다.", BAD_REQUEST_ERROR);
    }

    const updated = await reservationAdminRepository.updateReservationStatus(
      id,
      status
    );
    if (!updated) {
      throw myError("예약 상태 업데이트에 실패했습니다.", NOT_FOUND_ERROR);
    }
    return true;
  },
};

export default reservationAdminService;
