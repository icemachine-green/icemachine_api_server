import subscriptionService from '../services/subscription.service.js';

const subscriptionController = {
  /**
   * Push Subscription 저장
   */
  async createSubscription(req, res, next) {
    try {
      const userId = req.user.id; // authMiddleware에서 주입
      const { endpoint, keys, userAgent } = req.body;

      if (!endpoint || !keys?.p256dh || !keys?.auth) {
        return res.status(400).json({
          message: 'Invalid subscription payload',
        });
      }

      const subscription = await subscriptionService.saveSubscription({
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent,
      });

      return res.status(201).json({
        message: 'Subscription saved',
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default subscriptionController;
