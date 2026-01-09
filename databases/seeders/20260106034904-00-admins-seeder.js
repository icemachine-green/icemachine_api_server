/**
 * @file databases/seeders/20251231-01-admin-seeder.js
 * @description 관리자 초기 계정 생성 (최고관리자 & 일반관리자)
 */
import bcrypt from "bcrypt";
import dayjs from "dayjs";

// 테스트용 최고관리자 id: superadmin / pw: admin1234!
// 테스트용 일반관리자 id: admin01 / pw: admin1234!
export default {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash("admin1234!", 10);
    const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

    await queryInterface.bulkInsert("admins", [
      {
        username: "superadmin",
        password_hash: passwordHash,
        name: "최고관리자",
        role: "SUPER_ADMIN",
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        username: "admin01",
        password_hash: passwordHash,
        name: "이관리",
        role: "ADMIN",
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    // 모든 관리자 데이터 삭제 (초기화용)
    await queryInterface.bulkDelete("admins", null, {});
  },
};
