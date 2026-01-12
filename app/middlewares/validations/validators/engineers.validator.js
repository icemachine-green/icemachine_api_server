/**
 * @file app/middlewares/validations/validators/engineers.validator.js
 * @description engineers 유효성 검사기
 * 260108 v1.0.0 jung init
 */

import engineersField from "../fields/engineers.field.js";

const reservationValidator = [engineersField.page, engineersField.limit, engineersField.date];

export default {
  reservationValidator,
}