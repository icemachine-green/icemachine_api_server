/**
 * @file configs/webpush.config.js
 * @description Web Push 설정
 * 251216 v1.0.0 Lee init
 */
import webpush from "web-push";

if (
  process.env.WEB_PUSH_VAPID_PUBLIC_KEY &&
  process.env.WEB_PUSH_VAPID_PRIVATE_KEY
) {
  webpush.setVapidDetails(
    `mailto:${process.env.JWT_ISSUER}`,
    process.env.WEB_PUSH_VAPID_PUBLIC_KEY,
    process.env.WEB_PUSH_VAPID_PRIVATE_KEY
  );
} else {
  console.warn("WEB PUSH VAPID 키가 설정되지 않았습니다.");
}

export default webpush;
