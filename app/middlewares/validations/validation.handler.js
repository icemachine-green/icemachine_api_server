/**
 * @file app/middlewares/validations/validation.handler.js
 * @description 유효성 검사 핸들러
 * 251216 v1.0.0 Lee init
 */
import { validationResult } from "express-validator";
import { createBaseResponse } from "../../utils/createBaseResponse.util.js";
import { BAD_REQUEST_ERROR } from "../../../configs/responseCode.config.js";

/**
 * Express-validator의 유효성 검사 결과를 처리하는 미들웨어
 * @param {import("express").Request} req - Request 객체
 * @param {import("express").Response} res - Response 객체
 * @param {import("express").NextFunction} next - NextFunction 객체
 */
const validationHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // 에러 메시지를 하나로 합치거나, 첫 번째 에러만 사용
    const errorMessage = errors.array()[0].msg;
    const errorResponse = { ...BAD_REQUEST_ERROR, info: errorMessage };
    
    return res.status(errorResponse.status).send(createBaseResponse(errorResponse));
  }
  next();
};

export default validationHandler;
