// seeders/20260101-03-engineer-shift-seeder.js
import dayjs from "dayjs";

const generateEngineerShifts = (engineers) => {
  const shifts = [];
  engineers.forEach((engineer) => {
    // 월~금 (1=월, 5=금)
    for (let day = 1; day <= 5; day++) {
      shifts.push({
        engineer_id: engineer.id, // 새 PK 기준
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
      `SELECT id FROM engineers WHERE deleted_at IS NULL;` // 새 PK 기준
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
