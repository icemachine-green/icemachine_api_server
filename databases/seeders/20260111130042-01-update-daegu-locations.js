/**
 * @file seeders/XXXXXXXXXXXXXX-update-daegu-locations.js
 */
import { faker } from "@faker-js/faker";

export default {
  async up(queryInterface, Sequelize) {
    const [businesses] = await queryInterface.sequelize.query(
      `SELECT id FROM businesses WHERE deleted_at IS NULL`
    );

    for (const biz of businesses) {
      // 대구 중심 (35.87, 128.60) 기준으로 오차 범위를 주어 랜덤 생성
      // 위도: 35.75 ~ 35.95 (대구 남북 범위)
      // 경도: 128.45 ~ 128.75 (대구 동서 및 경산 범위)
      const lat = faker.location.latitude({
        max: 35.95,
        min: 35.75,
        precision: 6,
      });
      const lng = faker.location.longitude({
        max: 128.75,
        min: 128.45,
        precision: 6,
      });

      await queryInterface.sequelize.query(
        `UPDATE businesses SET latitude = ${lat}, longitude = ${lng} WHERE id = ${biz.id}`
      );
    }
    console.log(
      `${businesses.length}개 매장의 좌표를 대구권역으로 업데이트했습니다.`
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `UPDATE businesses SET latitude = NULL, longitude = NULL`
    );
  },
};
