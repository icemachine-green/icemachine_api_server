import dayjs from "dayjs";
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

  // 숫자로 확실하게 형변환
  const nLat1 = parseFloat(lat1);
  const nLon1 = parseFloat(lon1);
  const nLat2 = parseFloat(lat2);
  const nLon2 = parseFloat(lon2);

  if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2)) return null;

  const R = 6371;
  const dLat = (nLat2 - nLat1) * (Math.PI / 180);
  const dLon = (nLon2 - nLon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(nLat1 * (Math.PI / 180)) *
      Math.cos(nLat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

/**
 * 데이터 변환 DTO
 */
const _toReservationListDTO = (reservation) => {
  if (!reservation) return null;
  try {
    const res = reservation.get
      ? reservation.get({ plain: true })
      : reservation;

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
      throw myError(
        "대시보드 통계 조회 중 서버 오류가 발생했습니다.",
        DB_ERROR
      );
    }
  },

  getReservations: async (page, limit, filters) => {
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (safePage - 1) * safeLimit;
    try {
      const result = await reservationAdminRepository.findAllReservations({
        offset,
        limit: safeLimit,
        ...filters,
      });
      const processedRows = (result?.rows || []).map(_toReservationListDTO);
      return buildPaginatedResponse(
        safePage,
        safeLimit,
        result?.count || 0,
        processedRows
      );
    } catch (error) {
      console.error("[Service getReservations Error]:", error);
      throw myError(
        "예약 목록 검색 중 데이터베이스 오류가 발생했습니다.",
        DB_ERROR
      );
    }
  },

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
      throw myError("상세 정보 조회 중 서버 오류가 발생했습니다.", DB_ERROR);
    }
  },

  updateReservationStatus: async (id, status) => {
    try {
      const isUpdated =
        await reservationAdminRepository.updateReservationStatus(id, status);
      if (!isUpdated)
        throw myError("업데이트할 예약이 존재하지 않습니다.", NOT_FOUND_ERROR);
      return true;
    } catch (error) {
      console.error("[Service updateStatus Error]:", error);
      throw myError("상태 업데이트 중 서버 오류가 발생했습니다.", DB_ERROR);
    }
  },

  assignEngineer: async (reservationId, engineerId) => {
    try {
      const isUpdated =
        await reservationAdminRepository.updateEngineerAssignment(
          reservationId,
          engineerId
        );
      if (!isUpdated)
        throw myError("배정 처리 중 오류가 발생했습니다.", NOT_FOUND_ERROR);
      return true;
    } catch (error) {
      console.error("[Service assignEngineer Error]:", error);
      throw myError("기사 배정 처리 중 서버 오류가 발생했습니다.", DB_ERROR);
    }
  },

  /**
   * 재배정 추천 기사 리스트 조회 (v1.2.4)
   * 수정 사항: get({ plain: true })로 Getter 무력화 및 소수점 위경도 강제 형변환
   */
  getRecommendedEngineers: async (id) => {
    if (!id) throw myError("예약 ID가 누락되었습니다.", BAD_REQUEST_ERROR);

    try {
      const targetResRaw =
        await reservationAdminRepository.findReservationDetail(id);
      if (!targetResRaw)
        throw myError("해당 예약을 찾을 수 없습니다.", NOT_FOUND_ERROR);

      // plain 객체 변환 (중요: 인스턴스의 Getter 영향 없이 순수 데이터 접근)
      const targetRes = targetResRaw.get
        ? targetResRaw.get({ plain: true })
        : targetResRaw;
      const targetStart = dayjs(targetRes.serviceStartTime);
      const targetEnd = dayjs(targetRes.serviceEndTime);

      const tLat = targetRes.Business?.latitude;
      const tLon = targetRes.Business?.longitude;

      const engineers =
        await reservationAdminRepository.findEngineersWithScheduleForRecommendation(
          targetRes.reservedDate
        );

      const recommendedList = engineers.map((engInstance) => {
        const eng = engInstance.get
          ? engInstance.get({ plain: true })
          : engInstance;
        const todayJobs = eng.Reservations || [];

        // 1. 가용성 체크
        const checkStart = targetStart.subtract(60, "minute");
        const checkEnd = targetEnd.add(60, "minute");

        const isAvailable = !todayJobs.some((job) => {
          if (Number(job.id) === Number(id)) return false;
          const jobStart = dayjs(job.serviceStartTime);
          const jobEnd = dayjs(job.serviceEndTime);
          return jobStart.isBefore(checkEnd) && jobEnd.isAfter(checkStart);
        });

        // 2. 여유 시간 계산
        const totalRestTime = 480 - todayJobs.length * 60;

        // 3. 거리 계산 (현재 수정 건 제외하고 직전 업무 찾기)
        const prevJob = todayJobs
          .filter((j) => {
            if (Number(j.id) === Number(id)) return false;
            const jobEndTime = dayjs(j.serviceEndTime);
            return (
              jobEndTime.isBefore(targetStart) || jobEndTime.isSame(targetStart)
            );
          })
          .sort((a, b) =>
            dayjs(b.serviceEndTime).diff(dayjs(a.serviceEndTime))
          )[0];

        const distanceKm =
          prevJob?.Business && tLat && tLon
            ? _calculateDistance(
                prevJob.Business.latitude,
                prevJob.Business.longitude,
                tLat,
                tLon
              )
            : null;

        return {
          engineerId: eng.id,
          name: eng.User?.name,
          phoneNumber: eng.User?.phoneNumber,
          totalRestTime: parseInt(totalRestTime, 10),
          distanceKm: distanceKm ? Number(distanceKm.toFixed(1)) : null,
          isAvailable,
          todayJobCount: todayJobs.length,
        };
      });

      // 거리 순, 여유 시간 순 정렬
      return recommendedList.sort((a, b) => {
        if (a.distanceKm !== null && b.distanceKm !== null)
          return a.distanceKm - b.distanceKm;
        return b.totalRestTime - a.totalRestTime;
      });
    } catch (error) {
      console.error("[Service getRecommendedEngineers Error]:", error);
      throw myError(
        "추천 기사 리스트 조회 중 서버 오류가 발생했습니다.",
        DB_ERROR
      );
    }
  },
};

export default reservationAdminService;
