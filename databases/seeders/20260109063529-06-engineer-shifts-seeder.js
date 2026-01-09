/**
 * @file databases/seeders/[timestamp]-06-engineer-shift-seeder.js
 * @description 엔지니어별 주간 고정 스케줄 (월~금, 09:00~18:00)
 */
import dayjs from "dayjs";

const generateEngineerShifts = (engineers) => {
  const shifts = [];
  const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

  engineers.forEach((engineer) => {
    // 요일 반복: 1(월) ~ 5(금)
    for (let day = 1; day <= 5; day++) {
      shifts.push({
        engineer_id: engineer.id,
        available_date: day, // 요일 값 저장 (시스템 기획에 따라 요일 또는 날짜)
        shift_start: "09:00:00",
        shift_end: "18:00:00",
        created_at: now,
        updated_at: now,
        deleted_at: null,
      });
    }
  });
  return shifts;
};

export default {
  async up(queryInterface) {
    // 1. 05번에서 생성한 엔지니어 PK 조회
    const [engineers] = await queryInterface.sequelize.query(
      `SELECT id FROM engineers WHERE deleted_at IS NULL;`
    );

    if (!engineers || engineers.length === 0) {
      throw new Error(
        "엔지니어 데이터를 먼저 생성해야 합니다. (05-engineer-seeder 확인)"
      );
    }

    const shifts = generateEngineerShifts(engineers);

    // 2. 데이터 벌크 인서트
    await queryInterface.bulkInsert("engineer_shifts", shifts);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("engineer_shifts", null, {});
  },
};
