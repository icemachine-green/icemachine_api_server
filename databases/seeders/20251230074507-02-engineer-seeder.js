/**
 * engineers 테이블 더미데이터 시더
 *
 * 대상:
 * - users 테이블 중 role = 'engineer' 인 유저
 *
 * 목적:
 * - 기사 기술 등급 분포 생성
 * - 예약 가능 / 불가능 상태 테스트
 */

import { QueryTypes } from "sequelize";

export default {
  async up(queryInterface, Sequelize) {
    // users 테이블에서 기사 계정만 조회
    const engineersUsers = await queryInterface.sequelize.query(
      `
      SELECT id
      FROM users
      WHERE role = 'engineer'
        AND deleted_at IS NULL
      `,
      { type: QueryTypes.SELECT }
    );

    const engineers = [];

    engineersUsers.forEach((user) => {
      // 기술 등급 분포 (현실적으로)
      const rand = Math.random();
      let skillLevel = "JUNIOR";

      if (rand < 0.15) skillLevel = "MASTER"; // 15%
      else if (rand < 0.45) skillLevel = "SENIOR"; // 30%
      else skillLevel = "JUNIOR"; // 55%

      engineers.push({
        user_id: user.id,
        skill_level: skillLevel,
        introduction: "제빙기 청소 및 위생 관리 전문 기사입니다.",
        is_active: Math.random() > 0.1, // 90% 활성 / 10% 비활성
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      });
    });

    await queryInterface.bulkInsert("engineers", engineers);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("engineers", null, {});
  },
};
