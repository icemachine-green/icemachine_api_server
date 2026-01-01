/**
 * @file app/repositories/reviews.repository.js
 * @description 리뷰 관련 레포지토리
 * 251229 v1.0.0 Lee init
 */
import db from '../models/index.js';

const { Review, User } = db;

const findAllReviews = async (sort = 'latest') => {
  let order;

  switch (sort) {
    case 'highest':
      order = [['rating', 'DESC']];
      break;
    case 'lowest':
      order = [['rating', 'ASC']];
      break;
    case 'latest':
    default:
      order = [['createdAt', 'DESC']];
      break;
  }

  return await Review.findAll({
    attributes: ['id', 'userId', 'imageUrl', 'rating', 'content', 'createdAt'],
    include: [
      {
        model: User,
        attributes: ['name'],
      },
    ],
    order, // 결정된 정렬 순서 적용
  });
};

const findReviewsByUserId = async ({ userId, limit, offset }) => {
  const { rows, count } = await Review.findAndCountAll({
    where: { userId },
    include: [
      {
        model: User,
        attributes: ['name'],
      },
    ],
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

   return { rows, count };
};

const createReview = async (reviewData) => {
  return await Review.create(reviewData);
};

const deleteReview = async (reviewId, userId) => {
  const review = await Review.findOne({
    where: { id: reviewId, userId: userId },
  });

  if (!review) {
    return null; // Review not found or doesn't belong to the user
  }

  await review.destroy();
  return true; // Deletion successful
};

export default {
  findAllReviews,
  findReviewsByUserId,
  createReview,
  deleteReview,
};
