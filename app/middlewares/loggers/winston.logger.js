/**
 * @file app/middlewares/loggers/winston.logger.js
 * @description winston Logger (dayjs 에러 수정 버전)
 * 260110 v1.0.2 Lee update: dayjs locale 에러 수정
 */

import winston from "winston";
import dayjs from "dayjs";

// --------------
// private
// --------------
// 커스텀 포맷 작성
const customFormat = winston.format.printf(({ message, level }) => {
  // locale() 대신 포맷팅만 사용해도 현재 시스템 시간이 KST라면 문제 없습니다.
  // 만약 서버 시간이 해외라면 .add(9, 'hour') 등을 쓰기도 하지만,
  // 일단 가장 안전한 기본 포맷으로 바꿨습니다.
  const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
  return `[${now}] ${level} - ${message}`;
});

// --------------
// public
// --------------
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(customFormat),
  transports: [
    // 1. 파일로 출력
    new winston.transports.File({
      filename: `${process.env.LOG_BASE_PATH || "logs"}/${dayjs().format(
        "YYYYMMDD"
      )}_${process.env.LOG_FILE_NAME || "server.log"}`,
    }),

    // 2. 콘솔 출력 (터미널에서 바로 확인용)
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), customFormat),
    }),
  ],
});
