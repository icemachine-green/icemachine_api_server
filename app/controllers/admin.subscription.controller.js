/**
 * @file app/controllers/admin.subscription.controller.js
 * @description 관리자 푸시 구독 컨트롤러
 * 260113 v1.0.0 Lee init
 */
import { SUCCESS } from "../../configs/responseCode.config.js";
import adminSubscriptionService from "../services/admin.subscription.service.js";
import { createBaseResponse } from "../utils/createBaseResponse.util.js";

const adminSubscriptionController = {
  /**
   * Admin Push Subscription 저장
   */
  async createSubscription(req, res, next) {
    try {
      const { subscription, deviceInfo } = req.body;
      const adminId = req.admin.id; // authAdminMiddleware로부터 추출

      await adminSubscriptionService.createSubscription({
        adminId,
        subscription,
        deviceInfo,
      });

      return res
        .status(SUCCESS.status)
        .send(createBaseResponse(SUCCESS, null, "알림 설정이 완료되었습니다."));
    } catch (error) {
      return next(error);
    }
  },
};

export default adminSubscriptionController;
