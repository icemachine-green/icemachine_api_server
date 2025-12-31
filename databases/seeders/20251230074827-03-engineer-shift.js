/**
 * engineer_shifts 테이블 더미데이터 시더
 *
 * 목적:
 * - 기사별 요일 + 근무 시간 생성
 * - 달력 시간대 disable 테스트용
 */

import { QueryTypes } from "sequelize";

export default {
  async up(queryInterface) {
    // engineers 테이블의 기사 목록 조회
    const engineers = await queryInterface.sequelize.query(
      `
      SELECT user_id
      FROM engineers
      WHERE deleted_at IS NULL
      `,
      { type: QueryTypes.SELECT }
    );

    const shifts = [];

    engineers.forEach((engineer) => {
      // 월(1) ~ 금(5)
      for (let day = 1; day <= 5; day++) {
        // 20% 확률로 해당 요일 휴무
        if (Math.random() < 0.2) return;

        // 근무 시간 패턴
        const startHour = Math.random() < 0.2 ? "10:00:00" : "09:00:00";
        const endHour = Math.random() < 0.2 ? "17:00:00" : "18:00:00";

        shifts.push({
          engineer_id: engineer.user_id,
          available_date: day,
          shift_start: startHour,
          shift_end: endHour,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        });
      }
    });

    await queryInterface.bulkInsert("engineer_shifts", shifts);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("engineer_shifts", null, {});
  },
};
