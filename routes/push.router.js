import express from 'express';
import webpush from '../configs/webpush.config.js';
import { subscriptions } from './subscription.router.js';
import { SUCCESS, BAD_REQUEST_ERROR, SYSTEM_ERROR } from '../configs/responseCode.config.js';
import { createBaseResponse } from '../app/utils/createBaseResponse.util.js';

const router = express.Router();

/**
 * 푸시 알림 발송
 */
router.post('/', async (req, res) => {
  try {
    const { title, message, targetUrl } = req.body;

    // 요청 검증
    if (!title || !message || !targetUrl) {
      return res
        .status(BAD_REQUEST_ERROR.status)
        .send(createBaseResponse(BAD_REQUEST_ERROR));
    }

    // payload 구성 (서비스워커 push 이벤트에서 받는 데이터)
    const payload = JSON.stringify({
      title,
      message,
      data: {
        targetUrl,
      },
    });

    // 모든 구독자에게 발송
    const sendResults = await Promise.allSettled(
      subscriptions.map((item) =>
        webpush.sendNotification(item.subscription, payload)
      )
    );

    // 실패한 구독 제거 (410 Gone 등)
    sendResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        const statusCode = result.reason?.statusCode;
        if (statusCode === 410 || statusCode === 404) {
          subscriptions.splice(index, 1);
        }
      }
    });

    return res
      .status(SUCCESS.status)
      .send(createBaseResponse(SUCCESS));
  } catch (error) {
    console.error('[PUSH_SEND_ERROR]', error);

    return res
      .status(SYSTEM_ERROR.status)
      .send(createBaseResponse(SYSTEM_ERROR));
  }
});

export { router as pushRouter };