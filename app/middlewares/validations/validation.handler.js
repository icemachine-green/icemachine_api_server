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
    // express validation error custom
    const customErrors = errors.formatWith(error => `${error.path}: ${error.msg}`);

    // 에러 응답
    return res.status(BAD_REQUEST_ERROR.status)
      .send(createBaseResponse(BAD_REQUEST_ERROR, customErrors.array()));
  }
  next();
};

export default validationHandler;
