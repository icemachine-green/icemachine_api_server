/**
 * @file app/middlewares/validations/fields/user.signup.field.js
 * @description 사용자 회원가입 필드 유효성 검사
 * 251216 v1.0.0 Lee init
 */
import { body } from "express-validator";

const email = body("email")
  .trim()
  .notEmpty()
  .withMessage("이메일은 필수 항목입니다.")
  .bail()
  .isEmail()
  .withMessage("유효한 이메일을 입력해주세요.");

const password = body("password")
  .trim()
  .notEmpty()
  .withMessage("비밀번호는 필수 항목입니다.")
  .bail()
  .isLength({ min: 8, max: 20 })
  .withMessage("비밀번호는 8~20자 이어야 합니다.");

const passwordCheck = body("passwordCheck")
  .trim()
  .notEmpty()
  .withMessage("비밀번호 확인은 필수 항목입니다.")
  .custom((val, { req }) => {
    if (val !== req.body.password) {
      return false;
    }
    return true;
  })
  .withMessage("비밀번호가 일치하지 않습니다.");

const name = body("name")
  .trim()
  .notEmpty()
  .withMessage("이름은 필수 항목입니다.");

const phone_number = body("phone_number")
  .trim()
  .notEmpty()
  .withMessage("연락처는 필수 항목입니다.");

export default {
  email,
  password,
  passwordCheck,
  name,
  phone_number,
};
