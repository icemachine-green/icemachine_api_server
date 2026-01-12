import userAdminRepository from "../repositories/user.admin.repository.js";
import myError from "../errors/customs/my.error.js";
import {
  DB_ERROR,
  BAD_REQUEST_ERROR,
  NOT_FOUND_ERROR,
} from "../../configs/responseCode.config.js";
import { buildPaginatedResponse } from "../utils/pagination.util.js";

const userAdminService = {
  getUsers: async (queryParams) => {
    try {
      // 1. 공백 제거 (Trimming)
      const filters = Object.keys(queryParams).reduce((acc, key) => {
        const val = queryParams[key];
        acc[key] = typeof val === "string" ? val.trim() : val;
        return acc;
      }, {});

      const page = Math.max(1, parseInt(filters.page, 10) || 1);
      const limit = Math.max(1, parseInt(filters.limit, 10) || 10);
      const offset = (page - 1) * limit;

      // 2. Repository 호출 (정렬 및 필터 로직 포함)
      const result = await userAdminRepository.findAllUsers({
        offset,
        limit,
        ...filters,
      });

      // 3. 목록용 DTO 가공
      const processedRows = result.rows.map((user) => {
        const raw = user.get({ plain: true });
        return {
          id: raw.id,
          name: raw.name,
          phoneNumber: raw.phoneNumber,
          businessCount: raw.businessCount || 0,
          reservationCount: raw.reservationCount || 0,
          status: raw.deletedAt ? "탈퇴" : "정상",
          createdAt: raw.createdAt,
        };
      });

      return buildPaginatedResponse(page, limit, result.count, processedRows);
    } catch (error) {
      console.error("[Service getUsers Error]:", error);
      throw myError("고객 목록 조회 중 오류가 발생했습니다.", DB_ERROR);
    }
  },

  getUserDetail: async (id) => {
    if (!id) throw myError("ID가 필요합니다.", BAD_REQUEST_ERROR);
    try {
      const rawData = await userAdminRepository.findUserDetail(id);
      if (!rawData) throw myError("고객을 찾을 수 없습니다.", NOT_FOUND_ERROR);

      const user = rawData.get({ plain: true });

      return {
        profile: { ...user, status: user.deletedAt ? "탈퇴" : "정상" },
        statistics: {
          totalReservations: user.Reservations?.length || 0,
          totalBusinesses: user.Businesses?.length || 0,
        },
        // 🚩 수정: 데이터가 없을 경우를 대비해 Optional Chaining(?.) 추가
        businesses: (user.Businesses || []).map((b) => ({
          ...b,
          iceMachines: b.IceMachines || [],
        })),
        // 🚩 수정: history 내의 Engineer 정보 접근 로직 보강
        history: (user.Reservations || []).map((r) => ({
          ...r,
          engineerName: r.Engineer?.User?.name || "미배정",
        })),
      };
    } catch (error) {
      // 🚩 에러 디버깅을 위해 로그 한 줄 추가 (나중에 지워도 됨)
      console.error("Detail Error:", error);
      if (error.status) throw error;
      throw myError("상세 정보 조회 중 오류가 발생했습니다.", DB_ERROR);
    }
  },
};

export default userAdminService;
