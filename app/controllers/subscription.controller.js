import { SUCCESS } from '../../configs/responseCode.config.js';
import subscriptionService from '../services/subscription.service.js';

const subscriptionController = {
  /**
   * Push Subscription 저장
   */
  async createSubscription(req, res, next) {
    try {
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
      const { subscription, deviceInfo } = req.body;
      const userId = req.user.id;

      await subscriptionService.createSubscription({userId, subscription, deviceInfo});

      return res.status(SUCCESS.status).send(createBaseResponse(SUCCESS));
    } catch(error) {
      return next(error);
    }
  },
};

export default subscriptionController;
