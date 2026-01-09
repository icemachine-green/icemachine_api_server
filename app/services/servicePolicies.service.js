/**
 * @file app/services/servicePolicies.service.js
 * @description 서비스 정책 관련 서비스
 * 260109 v1.0.0
 */

import servicePoliciesRepository from "../repositories/servicePolicies.repository.js";
import myError from "../errors/customs/my.error.js";
import { NOT_FOUND_ERROR } from "../../configs/responseCode.config.js";

/**
 * 전체 서비스 정책 목록 조회
 */
const getActivePolicies = async () => {
  const policies = await servicePoliciesRepository.findAllActivePolicies();

  // 정책 데이터가 하나도 없는 경우 예외 처리
  if (!policies || policies.length === 0) {
    throw new myError("등록된 서비스 정책이 없습니다.", NOT_FOUND_ERROR);
  }

  return policies;
};

export default {
  getActivePolicies,
};
