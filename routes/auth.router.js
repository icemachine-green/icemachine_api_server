/**
 * @file routes/auth.router.js
 * @description 인증 관련 라우터
 * 251224 v1.0.0 Taeho-init
 */
import express from "express";
import usersController from "../app/controllers/users.controller.js";
import socialSignupValidator from "../app/middlewares/validations/validators/user.social-signup.validator.js";
import validationHandler from "../app/middlewares/validations/validation.handler.js";
import engineersController from "../app/controllers/engineers.controller.js";
import authMiddleware from "../app/middlewares/auth/auth.middleware.js";

const router = express.Router();

router.get("/kakao/authorize/:client", usersController.kakaoAuthorize);
router.get("/kakao/callback", usersController.kakaoCallback);
router.post(
  "/social-signup",
  socialSignupValidator,
  validationHandler,
  usersController.socialSignup
);
router.post('/social-signup/engineer', engineersController.socialSignup);
router.post("/reissue", usersController.reissue);
router.post('/logout', authMiddleware, usersController.logout);

export default router;
