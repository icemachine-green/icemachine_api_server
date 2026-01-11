import webpush from "web-push";

// VAPID 설정 (서버 시작 시 1회)
webpush.setVapidDetails(
  "mailto:admin@icemachine.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function sendWebPush(subscription, payload) {
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
  } catch (error) {
    console.error("❌ WebPush 전송 실패", error);
    throw error;
  }
}
