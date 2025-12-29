/**
 * @file app/services/reviews.service.js
 * @description 리뷰 관련 서비스
 * 251229 v1.0.0 Lee init
 */
import reviewsRepository from '../repositories/reviews.repository.js';

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

export default {
  getAllReviews,
  createReview,
};
