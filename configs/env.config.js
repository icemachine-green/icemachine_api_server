/**
 * @file configs/env.config.js
 * @description 환경변수 설정
 * 251216 v1.0.0 Lee init
 */

import fs from "fs";
import dotenv from "dotenv";

const envFiles = [".env.production", ".env.test", ".env"];

// envFiles 루프: 해당 파일이 있으면 파일경로 저장
// 예1) .env.test와 .env가 있을 경우 최종적으로 .env를 셋팅
// 예2) .env.test만 .env 있을 경우 최종적으로 .env.test를 셋팅
// 예3) .env.production, .env.test, .env가 있을 경우 최종적으로 .env를 셋팅
let filePath = "";
for (const file of envFiles) {
  if (fs.existsSync(file)) {
    filePath = file;
  }
}

// 세팅된 filePathㄹ dotenv 설정
dotenv.config({
  path: filePath,
  debug: filePath === ".env" ? true : false,
});
console.log(`Loaded env: ${filePath}`);

// --- 디버깅용 로그 추가 ---
console.log('[DEBUG] APP_URL:', process.env.APP_URL);
console.log('[DEBUG] KAKAO_REST_API_KEY:', process.env.SOCIAL_KAKAO_REST_API_KEY);
// -------------------------

// Kakao API 환경 변수
// SOCIAL_KAKAO_API_URL_AUTHORIZE
// SOCIAL_KAKAO_API_URL_TOKEN
// SOCIAL_KAKAO_API_URL_LOGOUT
// SOCIAL_KAKAO_API_URL_USER_INFO
// SOCIAL_KAKAO_CALLBACK_URL
// SOCIAL_KAKAO_REST_API_KEY
// SOCIAL_CLIENT_CALLBACK_URL
