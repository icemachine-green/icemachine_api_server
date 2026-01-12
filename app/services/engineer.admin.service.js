import engineerAdminRepository from "../repositories/engineer.admin.repository.js";
import { buildPaginatedResponse } from "../utils/pagination.util.js";
import myError from "../errors/customs/my.error.js";
import {
  DB_ERROR,
  NOT_FOUND_ERROR,
} from "../../configs/responseCode.config.js";

const engineerAdminService = {
  getEngineers: async (page, limit, filters) => {
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (safePage - 1) * safeLimit;

    try {
      const { rows, count } = await engineerAdminRepository.findAllEngineers({
        offset,
        limit: safeLimit,
        ...filters,
      });

      // 대시보드용 요약 정보도 같이 가져옴
      const stats = await engineerAdminRepository.getEngineerSummaryStats();

      return {
        ...buildPaginatedResponse(safePage, safeLimit, count, rows),
        summary: stats,
      };
    } catch (error) {
      throw myError("기사 목록 조회 중 오류가 발생했습니다.", DB_ERROR);
    }
  },

  getEngineerDetail: async (id) => {
    const engineer = await engineerAdminRepository.findEngineerDetail(id);
    if (!engineer) throw myError("존재하지 않는 기사입니다.", NOT_FOUND_ERROR);
    return engineer;
  },

  updateEngineerInfo: async (id, data) => {
    const isUpdated = await engineerAdminRepository.updateEngineer(id, data);
    if (!isUpdated)
      throw myError("수정할 기사를 찾을 수 없습니다.", NOT_FOUND_ERROR);
  },

  updateEngineerStatus: async (id, status, resignationDate) => {
    const isUpdated = await engineerAdminRepository.updateStatus(
      id,
      status,
      resignationDate
    );
    if (!isUpdated) throw myError("상태 변경에 실패했습니다.", NOT_FOUND_ERROR);
  },
};

export default engineerAdminService;
