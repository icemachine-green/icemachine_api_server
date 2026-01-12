/**
 * @file app/services/servicePolicies.service.js
 * @description 서비스 정책 관련 서비스
 */
import servicePoliciesRepository from "../repositories/servicePolicies.repository.js";
import myError from "../errors/customs/my.error.js";
import {
  NOT_FOUND_ERROR,
  DB_ERROR,
} from "../../configs/responseCode.config.js";

/**
 * 전체 서비스 정책 목록 조회
 */
const getActivePolicies = async () => {
  let policies;
  try {
    policies = await servicePoliciesRepository.findAllActivePolicies();
  } catch (error) {
    throw myError(
      "서비스 정책 목록을 불러오는 중 데이터베이스 오류가 발생했습니다.",
      DB_ERROR
    );
  }

  // 정책 데이터가 하나도 없는 경우 예외 처리 로직 유지
  if (!policies || policies.length === 0) {
    throw myError("등록된 서비스 정책이 없습니다.", NOT_FOUND_ERROR);
  }

  return policies;
};

export default {
  getActivePolicies,
};
