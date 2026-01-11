import express from 'express';
import { SUCCESS, BAD_REQUEST_ERROR, SYSTEM_ERROR } from '../configs/responseCode.config.js';
import { createBaseResponse } from '../app/utils/createBaseResponse.util.js';

const router = express.Router();

/**
 * 임시 Push Subscription 저장소
 * ※ 서버 재시작 시 초기화
 */
const subscriptions = [];

router.post('/', (req, res) => {
  try {
    const { subscription, deviceInfo } = req.body;

    // 요청 데이터 검증
    if (!subscription || !subscription.endpoint) {
      return res.status(BAD_REQUEST_ERROR.status).send(createBaseResponse(BAD_REQUEST_ERROR));
    }

    // 중복 구독 체크 (endpoint 기준)
    const isExist = subscriptions.find(
      (item) => item.subscription.endpoint === subscription.endpoint
    );

    if (!isExist) {
      subscriptions.push({
        subscription,
        deviceInfo,
        createdAt: new Date(),
      });
    }

    console.log('📌 Push subscriptions count:', subscriptions.length);

    // 정상 응답
    return res.status(SUCCESS.status).send(createBaseResponse(SUCCESS));
  } catch (error) {
    console.error('[SUBSCRIPTION_ERROR]', error);

    return res.status(SYSTEM_ERROR.status).send(createBaseResponse(SYSTEM_ERROR));
  }
});

export { router as subscriptionRouter, subscriptions };