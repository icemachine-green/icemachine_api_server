import db from "../models/index.js";
import subscriptionRepository from "../repositories/subscription.repository.js";

const { Subscription } = db;

/**
 * Push Subscription 저장 (중복 endpoint 처리)
 */
const createSubscription = async({userId, subscription, deviceInfo}) => {
  // subscription의 구조
  // {
  //   endpoint: 'https://fcm.googleapis.com/fcm/send/dFlTq11Ly-w:...',
  //   expirationTime: null,
  //   keys: {
  //     p256dh: 'BD9B5KMdQbwgG7...',
  //     auth: 'OL56CZS...'
  //   }
  // }
  // deviceInfo의 구조
  // {
  //   userAgent: navigator.userAgent,   // 브라우저/디바이스 정보
  //   language: navigator.language      // 언어 정보
  // }
  const { endpoint, keys } = subscription;
  const { userAgent } = deviceInfo;

  const data = {
    userId: userId,
    endpoint: endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth,
    userAgent: userAgent
  }

  return await subscriptionRepository.upsert(null, data);
};

/**
 * 특정 유저의 활성 구독 조회 (push 발송용)
 */
const getActiveSubscriptionsByUser = async (userId) => {
  return await Subscription.findAll({
    where: {
      userId,
      isActive: true,
    },
  });
};

export default {
  createSubscription,
  getActiveSubscriptionsByUser,
};
