import reservationAdminRepository from "../repositories/reservation.admin.repository.js";
import myError from "../errors/customs/my.error.js";
import {
  NOT_FOUND_ERROR,
  BAD_REQUEST_ERROR,
  DB_ERROR,
} from "../../configs/responseCode.config.js";
import { buildPaginatedResponse } from "../utils/pagination.util.js";

/**
 * 데이터 변환 DTO (에러 방어 로직 추가)
 */
const _toReservationListDTO = (reservation) => {
  if (!reservation) return null;
  try {
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
  } catch (err) {
    console.error("[DTO Conversion Error]:", err);
    return { id: reservation.id, error: "데이터 가공 중 오류 발생" };
  }
};

const reservationAdminService = {
  /**
   * 대시보드 통계 조회
   */
  getDashboardStats: async (params) => {
    try {
      const stats = await reservationAdminRepository.getReservationStats(
        params
      );
      const initialStats = {
        PENDING: 0,
        CONFIRMED: 0,
        START: 0,
        COMPLETED: 0,
        CANCELED: 0,
      };

      if (stats && Array.isArray(stats)) {
        stats.forEach((stat) => {
          if (Object.prototype.hasOwnProperty.call(initialStats, stat.status)) {
            initialStats[stat.status] = parseInt(stat.count, 10) || 0;
          }
        });
      }
      return initialStats;
    } catch (error) {
      console.error("[Service getDashboardStats Error]:", error);
      if (error.status) throw error;
      throw myError(
        "대시보드 통계 조회 중 서버 오류가 발생했습니다.",
        DB_ERROR
      );
    }
  },

  /**
   * 예약 목록 검색 (정밀 필터링 포함)
   */
  getReservations: async (page, limit, filters) => {
    // 1. 파라미터 유효성 검사
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (safePage - 1) * safeLimit;

    if (filters.reservationId && isNaN(filters.reservationId)) {
      throw myError("예약 ID는 숫자 형식이어야 합니다.", BAD_REQUEST_ERROR);
    }

    try {
      // 2. 리포지토리 호출
      const result = await reservationAdminRepository.findAllReservations({
        offset,
        limit: safeLimit,
        ...filters,
      });

      const count = result?.count || 0;
      const rows = result?.rows || [];

      // 3. 데이터 가공 (DTO 변환 중 에러 발생 시 전체가 터지지 않게 관리)
      const processedRows = rows.map(_toReservationListDTO);

      return buildPaginatedResponse(safePage, safeLimit, count, processedRows);
    } catch (error) {
      console.error("[Service getReservations Error]:", error);
      // 이미 커스텀 에러(myError)인 경우 그대로 던짐
      if (error.status) throw error;
      // DB 에러나 일반 런타임 에러는 DB_ERROR 코드로 래핑
      throw myError(
        "예약 목록 검색 중 데이터베이스 오류가 발생했습니다.",
        DB_ERROR
      );
    }
  },

  /**
   * 상세 조회
   */
  getReservationDetail: async (id) => {
    if (!id)
      throw myError("조회할 예약 ID가 누락되었습니다.", BAD_REQUEST_ERROR);

    try {
      const reservation =
        await reservationAdminRepository.findReservationDetail(id);
      if (!reservation)
        throw myError("해당 예약을 찾을 수 없습니다.", NOT_FOUND_ERROR);

      return _toReservationListDTO(reservation);
    } catch (error) {
      console.error("[Service getReservationDetail Error]:", error);
      if (error.status) throw error;
      throw myError("상세 정보 조회 중 서버 오류가 발생했습니다.", DB_ERROR);
    }
  },

  /**
   * 상태 업데이트
   */
  updateReservationStatus: async (id, status) => {
    if (!id || !status)
      throw myError("ID와 상태값은 필수입니다.", BAD_REQUEST_ERROR);

    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "START",
      "COMPLETED",
      "CANCELED",
    ];
    if (!validStatuses.includes(status)) {
      throw myError("올바르지 않은 상태값입니다.", BAD_REQUEST_ERROR);
    }

    try {
      const isUpdated =
        await reservationAdminRepository.updateReservationStatus(id, status);
      if (!isUpdated)
        throw myError("업데이트할 예약이 존재하지 않습니다.", NOT_FOUND_ERROR);

      return true;
    } catch (error) {
      console.error("[Service updateStatus Error]:", error);
      if (error.status) throw error;
      throw myError("상태 업데이트 중 서버 오류가 발생했습니다.", DB_ERROR);
    }
  },
};

export default reservationAdminService;
