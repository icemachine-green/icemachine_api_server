/**
 * @file app/controllers/reviews.controller.js
 * @description 리뷰 관련 컨트롤러
 * 251229 v1.0.0 Lee init
 */
import reviewsService from '../services/reviews.service.js';
import { createBaseResponse } from '../utils/createBaseResponse.util.js';
import { SUCCESS } from '../../configs/responseCode.config.js';

async function getAllReviews(req, res, next) {
  try {
    // 쿼리 스트링에서 정렬 옵션 획득 (e.g., /api/reviews?sort=highest)
    const { sort } = req.query;

    const reviews = await reviewsService.getAllReviews(sort);

    return res
      .status(SUCCESS.status)
      .send(createBaseResponse(SUCCESS, reviews));
  } catch (error) {
    next(error);
  }
}

async function getMyReviews(req, res, next) {
  try {
    // TODO: 로그인 미완성 → 임시
    // const userId = req.user.id;
    const userId = 1;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const result = await reviewsService.getMyReviews({
      userId,
      page,
      limit,
    });

    return res
      .status(SUCCESS.status)
      .send(createBaseResponse(SUCCESS, result));
  } catch (error) {
    next(error);
  }
}

async function createReview(req, res, next) {
  try {
    // 인증 미들웨어를 통해 전달된 사용자 ID 획득
    // const userId  = req.user?.id; // TODO: 로그인 완성되면 이코드로 변경
    const userId  = 1; // TODO: 로그인 완성되면 삭제
    const reviewDto = {
      rating: req.body?.rating ? req.body?.rating : null,
      content: req.body?.content ? req.body?.content : null,
      quickOption: req.body?.quickOption ? req.body?.quickOption : null,
      imageUrl: req.file?.filename ? req.file?.filename : null
    };

    const newReview = await reviewsService.createReview(userId, reviewDto);

    // 201 Created가 더 적합하지만, 프로젝트 컨벤션에 따라 200 OK와 SUCCESS 코드를 사용
    return res
      .status(SUCCESS.status)
      .send(createBaseResponse(SUCCESS, newReview)); 
  } catch (error) {
    next(error);
  }
}

async function deleteReview(req, res, next) {
  try {
    const { reviewId } = req.params;
    // const { id: userId } = req.user; // From authMiddleware // TODO: 로그인 완성되면 이코드로 변경
    const userId = 1; // TODO: 로그인 완성되면 삭제

    await reviewsService.deleteReview(reviewId, userId);

    return res
      .status(SUCCESS.status)
      .send(createBaseResponse(SUCCESS, { message: '리뷰가 성공적으로 삭제되었습니다.' }));
  } catch (error) {
    next(error);
  }
}

export default {
  getAllReviews,
  getMyReviews,
  createReview,
  deleteReview,
};
