import webpush from "web-push";
import db from "../models/index.js";

// VAPID 설정 (환경변수에서 로드)
webpush.setVapidDetails(
  "mailto:admin@icemachine.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const pushService = {
  /**
   * 일반 유저(고객/기사)에게 푸시 발송
   */
  async sendToUsers(userIds, payload) {
    const ids = Array.isArray(userIds) ? userIds : [userIds];
    const subs = await db.Subscription.findAll({
      where: { userId: ids, isActive: true },
    });
    return this._send(subs, payload);
  },

  /**
   * 관리자들에게 푸시 발송
   */
  async sendToAdmins(adminIds = null, payload) {
    const where = { isActive: true };
    if (adminIds) where.adminId = adminIds;

    const subs = await db.AdminSubscription.findAll({ where });
    return this._send(subs, payload);
  },

  /**
   * 내부 발송 로직
   */
  async _send(subscriptions, payload) {
    const tasks = subscriptions.map((sub) => {
      return webpush
        .sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { auth: sub.auth, p256dh: sub.p256dh },
          },
          JSON.stringify(payload)
        )
        .catch((err) => {
          console.error(`[Push Error] Endpoint: ${sub.endpoint}`, err);
          // 필요 시 여기서 isActive를 false로 업데이트하는 로직 추가 가능
        });
    });
    return Promise.all(tasks);
  },
};

export default pushService;
