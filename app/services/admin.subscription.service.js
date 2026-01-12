/**
 * @file app/services/admin.subscription.service.js
 * @description 관리자 푸시 구독 서비스
 * 260113 v1.0.0 Lee init
 */
import adminSubscriptionRepository from "../repositories/admin.subscription.repository.js";

/**
 * 관리자 Push Subscription 저장
 */
const createSubscription = async ({ adminId, subscription, deviceInfo }) => {
  const { endpoint, keys } = subscription;
  const { userAgent } = deviceInfo;

  const data = {
    adminId: adminId,
    endpoint: endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth,
    userAgent: userAgent,
  };

  return await adminSubscriptionRepository.upsert(null, data);
};

export default {
  createSubscription,
};
