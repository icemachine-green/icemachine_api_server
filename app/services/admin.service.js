/**
 * @file services/admin.service.js
 * @description 관리자 관련 service
 * 251230 v1.0.0 jung init
 */

import adminRepository from "../repositories/admin.repository.js";

async function getAllCustomers() {
  const allCustomers = await adminRepository.findAllCustomers();

  // 생성일 기준으로 내림차순 정렬
  allCustomers.sort((a, b) => b.createdAt - a.createdAt);

  // 필요한 정보만 가공하여 반환
  return allCustomers.map(user => ({
    userId: user.id,
    socialId: user.socialId,
    email: user.email,
    provider: user.provider,
    name: user.name,
    phone: user.phoneNumber,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));
}

export default {
  getAllCustomers,
}