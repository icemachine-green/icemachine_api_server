/**
 * @file routes/users.router.js
 * @description 유저 관련 라우터
 * 251216 v1.0.0 Lee init
 */
import express from "express";
import usersController from "../app/controllers/users.controller.js";
import socialSignupValidator from "../app/middlewares/validations/validators/user.social-signup.validator.js";
import validationHandler from "../app/middlewares/validations/validation.handler.js";

const router = express.Router();

// 소셜 회원가입 API
router.post(
  "/social-signup",
  socialSignupValidator,
  validationHandler,
  usersController.socialSignup
);

export default router;
