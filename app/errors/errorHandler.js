/**
 * @file app/errors/errorHandler.js
 * @description 에러 핸들러
 * 251216 v1.0.0 Lee init
 */

import { BaseError } from "sequelize";
import { DB_ERROR, SYSTEM_ERROR } from "../../configs/responseCode.config.js";
import { createBaseResponse } from "../utils/createBaseResponse.util.js";
// import { logger } from "../middlewares/loggers/winston.logger.js";
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
  // Sequelize 에러 처리
  // e = sequelize의 BaseError인가 아닌가 판별.
  if (e instanceof BaseError) {
    e.codeInfo = DB_ERROR;
  }

  // 예기치 못한 에러 발생 처리
  if (!e.codeInfo) {
    e.codeInfo = SYSTEM_ERROR;
  }

  // 시스템 에러 및 DB에러 일 경우, 로그 출력
  // if (e.codeInfo.code === SYSTEM_ERROR.code || e.codeInfo === DB_ERROR.code) {
  //   logger.error(`${e.name}: ${e.message}\n${e.stack}`);
  // }

  // 개발 모드일 경우 콘솔로 에러 로그 출력
  if (process.env.APP_MODE === "development") {
    console.log(`${e.name}: ${e.message}\n${e.stack}`);
  }

  return res.status(e.codeInfo.status).send(createBaseResponse(e.codeInfo));
}
