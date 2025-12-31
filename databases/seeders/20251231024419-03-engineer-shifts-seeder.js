/**
 * @file seeders/20251231-01-engineer-shift-seeder.js
 * @description 'engineer_shifts' 테이블 더미 데이터 생성
 */
import { faker } from "@faker-js/faker";
import dayjs from "dayjs";

const generateEngineerShifts = (engineers) => {
  if (!engineers || engineers.length === 0) {
    throw new Error(
      "Engineer array is empty! Ensure Engineer seed ran successfully."
    );
  }

  const shifts = [];

  engineers.forEach((engineer) => {
    // 월~금 (1=월, 5=금)
    for (let day = 1; day <= 5; day++) {
      shifts.push({
        engineer_id: engineer.user_id,
        available_date: day,
        shift_start: "09:00:00",
        shift_end: "18:00:00",
        created_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        updated_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        deleted_at: null,
      });
    }
  });

  return shifts;
};

export default {
  async up(queryInterface) {
    const [engineers] = await queryInterface.sequelize.query(
      `SELECT user_id FROM engineers WHERE deleted_at IS NULL;`
    );

    if (!engineers || engineers.length === 0) {
      throw new Error("No engineers found. Please run Engineer seed first.");
    }

    const shifts = generateEngineerShifts(engineers);
    await queryInterface.bulkInsert("engineer_shifts", shifts);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("engineer_shifts", null, {});
  },
};
