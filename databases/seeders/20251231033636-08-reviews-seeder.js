/**
 * @file databases/seeders/20251231-08-review-seeder.js
 */
import dayjs from "dayjs";
import { faker } from "@faker-js/faker";

const QUICK_OPTIONS = [
  "친절해요",
  "설명이 자세해요",
  "시간을 잘 지켜요",
  "청소가 깔끔해요",
  "전문적이에요",
];

export default {
  async up(queryInterface) {
    // COMPLETED 예약만 조회
    const [reservations] = await queryInterface.sequelize.query(`
      SELECT id AS reservation_id, user_id
      FROM reservations
      WHERE status = 'COMPLETED'
        AND deleted_at IS NULL
    `);

    if (!reservations.length) {
      console.warn("⚠️ COMPLETED reservation 없음 → review seeder 스킵");
      return;
    }

    const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const reviews = [];

    for (const r of reservations) {
      // 약 60% 확률로만 리뷰 생성
      if (Math.random() > 0.6) continue;

      reviews.push({
        user_id: r.user_id,
        reservation_id: r.reservation_id,
        rating: faker.number.int({ min: 3, max: 5 }),
        quick_option: faker.helpers.arrayElement(QUICK_OPTIONS),
        content: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
        image_url: Math.random() < 0.25 ? faker.image.urlPicsumPhotos() : null,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      });
    }

    if (!reviews.length) {
      console.warn("⚠️ 리뷰 생성 대상 없음");
      return;
    }

    await queryInterface.bulkInsert("reviews", reviews);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("reviews", null, {});
  },
};
