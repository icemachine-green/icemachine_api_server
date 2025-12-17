/**
 * @file app/middlewares/loggers/winston.logger.js
 * @description Winston 로거
 * 251216 v1.0.0 Lee init
 */

import winston from "winston";
import dayjs from "dayjs";

// --------------
// private
// --------------
const customFormat = winston.format.printf(({ message, level }) => {
  // [2525-11-24 10:12:50] level - message
  const now = dayjs().locale(process.env.APP_TZ).format("YYYY-MM-MM HH:mm:ss");

  return `[${now}] ${level} - ${message}`;
});

// --------------
// public
// --------------
// 범용 logger 인스턴스
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL, // 로그 레벨 제한
  format: winston.format.combine(customFormat),
  // transports: 로그를 출력하는 관리 설정 (예: 파일로 출력, 콘솔로 출력... 등의 설정)
  transports: [
    new winston.transports.File({
      filename: `${process.env.LOG_BASE_PATH}/${dayjs()
        .locale(process.env.APP_TZ)
        .format("YYYYMMDD")}_${
        process.env.LOG_FILE_NAME // 파일명 세팅
      }`,
      // level: "error", // 파일 작성 로그 레벨을 error로 제한
    }),
    // new winston.transports.Console(), // 콘솔로 에러 출력도 가능
  ],
});
