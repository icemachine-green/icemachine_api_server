import webpush from "web-push";

webpush.setVapidDetails(
  `mailto:${process.env.JWT_ISSUER}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default webpush;
