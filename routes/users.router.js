/**
 * @file routes/users.router.js
 * @description 유저 관련 라우터
 * 251216 v1.0.0 Lee init
 */
import express from "express";
import usersController from "../app/controllers/users.controller.js";
import authMiddleware from "../app/middlewares/auth/auth.middleware.js";

const router = express.Router();

// router.get("/me", authMiddleware, usersController.getMe); // TODO: 배포시 해당 코드로 수정
router.get("/me", usersController.getMe);
router.get("/check-email", usersController.checkEmailDuplicate);
// router.put("/me", authMiddleware, usersController.updateMe); // TODO: 배포시 해당 코드로 수정
router.put("/me", usersController.updateMe);
// router.delete("/me", authMiddleware, usersController.withdrawMe); // TODO: 배포시 해당 코드로 수정
router.delete("/me", usersController.withdrawMe);

export default router;
