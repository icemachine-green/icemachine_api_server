import webpush from "../../../configs/webpush.config.js";

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
