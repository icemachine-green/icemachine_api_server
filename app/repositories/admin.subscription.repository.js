/**
 * @file app/repositories/admin.subscription.repository.js
 * @description 관리자 푸시 구독 레포지토리
 * 260113 v1.0.0 Lee init
 */
import db from "../models/index.js";
const { AdminSubscription } = db;

async function upsert(t = null, data) {
  // adminId와 endpoint를 기준으로 중복 체크 후 업데이트 또는 삽입
  return await AdminSubscription.upsert(data, { transaction: t });
}

export default {
  upsert,
};
