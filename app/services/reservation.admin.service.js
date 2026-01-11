import reservationAdminRepository from "../repositories/reservation.admin.repository.js";
import myError from "../errors/customs/my.error.js";
import {
  NOT_FOUND_ERROR,
  BAD_REQUEST_ERROR,
  DB_ERROR,
} from "../../configs/responseCode.config.js";
import { buildPaginatedResponse } from "../utils/pagination.util.js";

/**
 * 내부 유틸: 하버사인 거리 계산 (Km)
 */
const _calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

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

  /**
   * 재배정 추천 기사 리스트 조회
   */
  getRecommendedEngineers: async (id) => {
    if (!id) throw myError("예약 ID가 누락되었습니다.", BAD_REQUEST_ERROR);

    try {
      // 1. 기준 예약 상세 정보 조회 (좌표 및 정책 포함)
      const targetRes = await reservationAdminRepository.findReservationDetail(
        id
      );
      if (!targetRes)
        throw myError("해당 예약을 찾을 수 없습니다.", NOT_FOUND_ERROR);

      const {
        reservedDate,
        serviceStartTime,
        Business: targetBiz,
        ServicePolicy: targetPolicy,
      } = targetRes;

      // 예약 시작/종료 시간 계산 (정책의 standardDuration 기준)
      const targetStart = dayjs(`${reservedDate} ${serviceStartTime}`);
      const duration = targetPolicy?.standardDuration || 60;
      const targetEnd = targetStart.add(duration, "minute");

      // 2. 해당 날짜 모든 기사 및 일정 조회
      const engineers =
        await reservationAdminRepository.findEngineersWithScheduleForRecommendation(
          reservedDate
        );

      // 3. 기사별 데이터 가공
      const recommendedList = engineers.map((eng) => {
        const todayJobs = eng.Reservations || [];

        // [여유 시간 계산] 8시간(480분) - (실제 작업시간 + 건당 1시간 버퍼)
        const actualWorkMin = todayJobs.reduce(
          (acc, job) => acc + (job.ServicePolicy?.standardDuration || 60),
          0
        );
        const totalBufferMin = todayJobs.length * 60;
        const totalRestTime = 480 - (actualWorkMin + totalBufferMin);

        // [가용성 체크] 타겟 시간 전후 1시간 버퍼 확보 여부
        // 검사 범위: (내 작업 시작 1시간 전) ~ (내 작업 종료 1시간 후)
        const checkStart = targetStart.subtract(60, "minute");
        const checkEnd = targetEnd.add(60, "minute");

        const isAvailable = !todayJobs.some((job) => {
          const jobStart = dayjs(`${reservedDate} ${job.serviceStartTime}`);
          const jobEnd = jobStart.add(
            job.ServicePolicy?.standardDuration || 60,
            "minute"
          );
          // 시간이 겹치면 불가
          return jobStart.isBefore(checkEnd) && jobEnd.isAfter(checkStart);
        });

        // [거리 계산] 직전 작업 매장 좌표 기준
        const prevJob = todayJobs
          .filter((j) =>
            dayjs(`${reservedDate} ${j.serviceStartTime}`).isBefore(targetStart)
          )
          .sort((a, b) =>
            dayjs(`${reservedDate} ${b.serviceStartTime}`).diff(
              dayjs(`${reservedDate} ${a.serviceStartTime}`)
            )
          )[0];

        const distanceKm = prevJob
          ? _calculateDistance(
              prevJob.Business?.latitude,
              prevJob.Business?.longitude,
              targetBiz?.latitude,
              targetBiz?.longitude
            )
          : null;

        return {
          engineerId: eng.id,
          name: eng.User?.name,
          phoneNumber: eng.User?.phoneNumber,
          totalRestTime, // 널널한 순서 정렬 기준
          distanceKm: distanceKm ? Number(distanceKm.toFixed(1)) : null,
          isAvailable,
          todayJobCount: todayJobs.length,
        };
      });

      // 4. 정렬: 여유 시간 많은 순(DESC)
      return recommendedList.sort((a, b) => b.totalRestTime - a.totalRestTime);
    } catch (error) {
      console.error("[Service getRecommendedEngineers Error]:", error);
      if (error.status) throw error;
      throw myError("추천 기사 리스트 조회 중 오류가 발생했습니다.", DB_ERROR);
    }
  },
};

export default reservationAdminService;
