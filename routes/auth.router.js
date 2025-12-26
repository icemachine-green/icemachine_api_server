/**
 * @file routes/auth.router.js
 * @description 인증 관련 라우터
 * 251224 v1.0.0 Taeho-init
 */
import express from "express";
import usersController from "../app/controllers/users.controller.js";
import socialSignupValidator from "../app/middlewares/validations/validators/user.social-signup.validator.js";
import validationHandler from "../app/middlewares/validations/validation.handler.js";

const router = express.Router();

// 카카오 인가 코드 요청을 위한 리다이렉트
router.get("/kakao/authorize", usersController.kakaoAuthorize);

// 카카오 콜백 처리
router.get("/kakao/callback", usersController.kakaoCallback);

// 소셜 회원가입 추가 정보 제출
router.post(
  "/social-signup",
  socialSignupValidator,
  validationHandler,
  usersController.socialSignup
);

// 토큰 재발급
router.post("/reissue", usersController.reissue);

export default router;
