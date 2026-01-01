/**
 * @file routes/reviews.router.js
 * @description 리뷰 관련 라우터
 * 251229 v1.0.0 Lee init
 */
import express from "express";
import reviewsController from "../app/controllers/reviews.controller.js";
import authMiddleware from "../app/middlewares/auth/auth.middleware.js";
import reviewUploader from "../app/middlewares/multer/review.uploader.js";

const router = express.Router();

router.get("/", reviewsController.getAllReviews);
// router.get("/me", authMiddleware, reviewsController.getMyReviews); // TODO: 배포시 해당 코드로 수정
router.get("/me", reviewsController.getMyReviews);
// router.post("/", authMiddleware, reviewUploader, reviewsController.createReview); // TODO: Validation 처리 추가 필요
router.post("/", reviewUploader, reviewsController.createReview); // TODO: Validation 처리 추가 필요
// router.delete("/:reviewId", authMiddleware, reviewsController.deleteReview); // TODO: 배포시 해당 코드로 수정
router.delete("/:reviewId", reviewsController.deleteReview);

export default router;
