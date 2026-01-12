/**
 * @file app/middlewares/validations/validators/user.social-signup.validator.js
 * @description 소셜 회원가입 유효성 검사기
 * 251224 v1.0.0 Taeho-init
 */
import socialSignupFields from "../fields/user.social-signup.field.js";

const socialSignupValidator = [
  socialSignupFields.socialId,
  socialSignupFields.provider,
  socialSignupFields.name,
  socialSignupFields.email,
  socialSignupFields.phoneNumber,
];

export default socialSignupValidator;
