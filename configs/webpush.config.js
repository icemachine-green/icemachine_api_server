/**
 * @file configs/webpush.config.js
 * @description Web Push 설정
 * 251216 v1.0.0 Lee init
 */
import webpush from "web-push";

webpush.setVapidDetails(
  `mailto:${process.env.JWT_ISSUER}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default webpush;
