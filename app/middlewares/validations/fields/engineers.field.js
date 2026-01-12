/**
 * @file app/middlewares/validations/fields/engineers.field.js
 * @description engineers 필드 유효성 검사
 * 260108 v1.0.0 jung init
 */
import { query } from "express-validator";

const page = query('page')
  .trim()
  .optional()
  .isNumeric()
  .withMessage('숫자만 허용합니다.');

const limit = query('limit')
  .trim()
  .optional()
  .isNumeric()
  .withMessage('숫자만 허용합니다.');

const date = query('date')
  .trim()
  .notEmpty()
  .withMessage('필수 항목입니다.')
  .bail()
  .matches(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)
  .withMessage('YYYY-MM-DD 양식만 허용합니다.');

export default {
  page,
  limit,
  date,
};
