import { faker } from "@faker-js/faker";
import dayjs from "dayjs";

const SKILL_LEVELS = ["JUNIOR", "SENIOR", "MASTER"];

export default {
  async up(queryInterface) {
    // User 테이블에서 role='ENGINEER' 조회
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role='ENGINEER' AND deleted_at IS NULL;`
    );

    if (!users || users.length === 0) {
      throw new Error(
        "No engineers found in Users table. Run User seed first."
      );
    }

    const engineerRows = users.map((user) => ({
      user_id: user.id, // FK
      skill_level: faker.helpers.arrayElement(SKILL_LEVELS),
      introduction: faker.lorem.sentence(),
      is_active: true,
      created_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      updated_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      deleted_at: null,
    }));

    await queryInterface.bulkInsert("engineers", engineerRows);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("engineers", null, {});
  },
};
