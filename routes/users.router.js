/**
 * @file routes/users.router.js
 * @description 유저 관련 라우터
 * 251216 v1.0.0 Lee init
 */
import express from "express";
import usersController from "../app/controllers/users.controller.js";
import signupValidator from "../app/middlewares/validations/validators/user.signup.validator.js";
import validationHandler from "../app/middlewares/validations/validation.handler.js";

const router = express.Router();

// 회원가입 API
router.post(
  "/signup",
  signupValidator,
  validationHandler,
  usersController.signup
);

export default router;
