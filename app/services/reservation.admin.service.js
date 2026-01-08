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
  getDashboardStats: async (startDate) => {
    // startDate를 리포지토리에 전달
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
      if (initialStats.hasOwnProperty(stat.status)) {
        initialStats[stat.status] = parseInt(stat.count, 10);
      }
    });
    return initialStats;
  },

  getReservations: async (page, limit, filters) => {
    const offset = (page - 1) * limit;

    // filters 객체 안에는 프론트에서 보낸 { orderBy, sortBy, status... } 등이 포함되어 있습니다.
    const { count, rows } =
      await reservationAdminRepository.findAllReservations({
        offset,
        limit,
        ...filters, // 이 전개 연산자가 orderBy와 sortBy를 Repository로 넘겨줍니다.
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
