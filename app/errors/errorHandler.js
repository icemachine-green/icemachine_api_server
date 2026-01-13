/**
 * @file app/errors/errorHandler.js 보강 버전
 */
import { BaseError } from "sequelize";
import { DB_ERROR, SYSTEM_ERROR } from "../../configs/responseCode.config.js";
import { createBaseResponse } from "../utils/createBaseResponse.util.js";
import { logger } from "../middlewares/loggers/winston.logger.js";
/**
 * 에러 핸들러
 * 모든 에러는 `err.codeInfo` 프로퍼티를 포함하고 있을 것
 * 파라미터로 전달받은 에러 객체에 `codeInfo`가 없을 경우, DB에러 or 시스템에러로 설정
 * 이 때, `codeInfo`는 {../configs/responseCode.config.type.js}.ResponseCode.Config 참조
 * @param {Error} e
 * @param {import('express'.Request)} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns
 */
export default function errorHandler(e, req, res, next) {
  // 1. Sequelize 에러 판별 (DB 컬럼명 틀리면 이리로 옵니다)
  if (e instanceof BaseError) {
    e.codeInfo = DB_ERROR;
  }

  // 2. 예기치 못한 에러 처리
  if (!e.codeInfo) {
    e.codeInfo = SYSTEM_ERROR;
  }

  // 4. 개발 모드일 경우 콘솔 출력
  if (process.env.APP_MODE === "development") {
    console.log(`[DEBUG ERROR] ${e.name}: ${e.message}`);
  }

  logger.error(`${e.name}: ${e.message}\n${e.stack}`);

  //  [핵심 보강] 개발 모드일 때는 응답에 상세 원인(e.message)을 끼워 넣어줌
  const response = createBaseResponse(e.codeInfo);

  if (process.env.APP_MODE === "development") {
    response.debug = {
      name: e.name,
      message: e.message,
      stack: e.stack ? e.stack.split("\n")[1].trim() : "", // 에러 발생 위치 한 줄만 추출
    };
  }

  return res.status(e.codeInfo.status).send(response);
}
