/**
 * @file app/repositories/servicePolicies.repository.js
 * @description 서비스 정책 관련 리포지토리
 * 260109 v1.0.0
 */

import db from "../models/index.js";

const { ServicePolicy } = db;

/**
 * 활성화된 모든 서비스 정책 조회
 */
const findAllActivePolicies = async () => {
  return await ServicePolicy.findAll({
    // isActive 컬럼이 모델에 없으므로 조건 없이 모두 조회
    order: [["id", "ASC"]],
    raw: true,
  });
};

/**
 * 특정 ID의 정책 조회
 */
const findPolicyById = async (id) => {
  return await ServicePolicy.findByPk(id, { raw: true });
};

export default {
  findAllActivePolicies,
  findPolicyById,
};
