/**
 * @file databases/seeders/20251231-09-schedule-photos-seeder.js
 */
import dayjs from "dayjs";
import { faker } from "@faker-js/faker";

const PHOTO_TYPES = ["BEFORE", "AFTER", "ISSUE"];

export default {
  async up(queryInterface) {
    // 완료된 예약만 대상
    const [reservations] = await queryInterface.sequelize.query(`
      SELECT id
      FROM reservations
      WHERE status = 'COMPLETED'
        AND deleted_at IS NULL
    `);

    if (!reservations.length) {
      console.warn(
        "⚠️ COMPLETED reservation 없음 → schedule_photo seeder 스킵"
      );
      return;
    }

    const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const photos = [];

    for (const r of reservations) {
      // 예약 1건당 1~4장
      const photoCount = faker.number.int({ min: 1, max: 4 });

      for (let i = 0; i < photoCount; i++) {
        photos.push({
          reservation_id: r.id,
          image_url: faker.image.urlPicsumPhotos({
            width: 800,
            height: 600,
          }),
          photo_type: faker.helpers.arrayElement(PHOTO_TYPES),
          description: Math.random() < 0.5 ? faker.lorem.sentence() : null,
          created_at: now,
          updated_at: now,
        });
      }
    }

    if (!photos.length) {
      console.warn("⚠️ schedule_photos 생성 대상 없음");
      return;
    }

    await queryInterface.bulkInsert("schedule_photos", photos);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("schedule_photos", null, {});
  },
};
