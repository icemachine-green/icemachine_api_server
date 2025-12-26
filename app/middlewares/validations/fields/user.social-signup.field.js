/**
 * @file app/middlewares/validations/fields/user.social-signup.field.js
 * @description 소셜 회원가입 유효성 검사 필드
 * 251224 v1.0.0 Taeho-init
 */
import { body } from "express-validator";

const socialId = body("socialId")
  .notEmpty()
  .withMessage("소셜 ID는 필수입니다.")
  .isString()
  .withMessage("소셜 ID는 문자열이어야 합니다.");

const provider = body("provider")
  .notEmpty()
  .withMessage("프로바이더는 필수입니다.")
  .isIn(['kakao'])
  .withMessage("유효하지 않은 프로바이더입니다.");

const name = body("name")
  .notEmpty()
  .withMessage("이름은 필수입니다.")
  .isLength({ min: 2, max: 50 })
  .withMessage("이름은 2자 이상 50자 이하이어야 합니다.");

const email = body("email")
  .notEmpty()
  .withMessage("이메일은 필수입니다.")
  .isEmail()
  .withMessage("유효하지 않은 이메일 형식입니다.");

// 대한민국 휴대폰 번호 형식 (010-XXXX-XXXX, 010XXXXXXXX)
// 하이픈이 있거나 없거나 상관없이 010으로 시작하고 총 10-11자리 숫자
const phoneNumber = body("phoneNumber")
    .notEmpty()
    .withMessage("연락처는 필수입니다.")
    .matches(/^01(?:0|1|[6-9])(?:\-)?(?:\d{3}|\d{4})(?:\-)?\d{4}$/)
    .withMessage("유효한 휴대폰 번호 형식이 아닙니다.");

export default {
    socialId,
    provider,
    name,
    email,
    phoneNumber
};
