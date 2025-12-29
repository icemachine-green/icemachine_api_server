/**
 * @file app/services/reviews.service.js
 * @description 리뷰 관련 서비스
 * 251229 v1.0.0 Lee init
 */
import reviewsRepository from "../repositories/reviews.repository.js";
import myError from "../errors/customs/my.error.js"; // myError import
import { NOT_FOUND_ERROR } from "../../configs/responseCode.config.js"; // NOT_FOUND_ERROR import

const getAllReviews = async (sort) => {
  const reviews = await reviewsRepository.findAllReviews(sort);

  // 컨트롤러에 전달하기 전에 데이터 형태를 가공
  return reviews.map((review) => {
    return {
      imageUrl: review.imageUrl,
      rating: review.rating,
      content: review.content,
      createdAt: review.createdAt,
      user_name: review.User.name, // 중첩된 User 객체의 name을 user_name으로 변경
    };
  });
};

const createReview = async (userId, reviewDto) => {
  const reviewData = {
    userId,
    rating: reviewDto.rating,
    quickOption: reviewDto.quickOption,
    content: reviewDto.content,
    imageUrl: reviewDto.imageUrl,
  };

  const newReview = await reviewsRepository.createReview(reviewData);
  return newReview;
};

const deleteReview = async (reviewId, userId) => {
  const isDeleted = await reviewsRepository.deleteReview(reviewId, userId);

  if (isDeleted === null) {
    // 리뷰를 찾을 수 없거나 해당 사용자의 리뷰가 아님을 알림
    throw myError(
      "리뷰를 찾을 수 없거나 삭제 권한이 없습니다.",
      NOT_FOUND_ERROR
    );
  }

  return true; // 삭제 성공
};

export default {
  getAllReviews,
  createReview,
  deleteReview,
};
