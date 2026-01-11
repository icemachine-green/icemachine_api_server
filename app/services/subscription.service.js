import db from "../models/index.js";

const { Subscription } = db;

/**
 * Push Subscription 저장 (중복 endpoint 처리)
 */
const saveSubscription = async({userId, endpoint, p256dh, auth, userAgent}) => {
  // 1. 동일 endpoint 존재 여부 확인
  const existing = await Subscription.findOne({
    where: { endpoint },
  });

  // 2. 이미 존재하면 업데이트 (재구독 케이스)
  if (existing) {
    existing.userId = userId;
    existing.p256dh = p256dh;
    existing.auth = auth;
    existing.userAgent = userAgent;
    existing.isActive = true;

    await existing.save();
    return existing;
  }

  // 3. 신규 구독 저장
  return Subscription.create({
    userId,
    endpoint,
    p256dh,
    auth,
    userAgent,
    isActive: true,
  });
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
  saveSubscription,
  getActiveSubscriptionsByUser,
};
