/**
 * @file app/middlewares/validations/validators/user.signup.validator.js
 * @description 사용자 회원가입 유효성 검사기
 * 251216 v1.0.0 Lee init
 */
import signupFields from "../fields/user.signup.field.js";

const signupValidator = [
  signupFields.email,
  signupFields.password,
  signupFields.passwordCheck,
  signupFields.name,
  signupFields.phone_number,
];

export default signupValidator;
