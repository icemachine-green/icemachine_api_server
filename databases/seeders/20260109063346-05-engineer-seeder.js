/**
 * @file databases/seeders/[timestamp]-05-engineer-seeder.js
 * @description 엔지니어 상세 프로필 (대구 지역 전문 기사 컨셉)
 */
import { faker } from "@faker-js/faker";
import dayjs from "dayjs";

const SKILL_LEVELS = ["JUNIOR", "SENIOR", "MASTER"];

// 한국어 전문 자기소개 리스트
const KOREAN_INTRODUCTIONS = [
  "대구 전 지역 제빙기 수리 및 세척 전문 기사입니다. 정직하게 시공하겠습니다.",
  "HOSHIZAKI, ICETRO 등 전 브랜드 대응 가능합니다. 꼼꼼한 점검 약속드립니다.",
  "10년 경력의 베테랑 엔지니어입니다. 빠르고 정확한 AS를 보장합니다.",
  "친절하고 상세한 설명으로 사장님들의 고민을 해결해 드립니다.",
  "제빙기 위생 관리는 전문가에게 맡기세요. 깔끔한 세척 서비스를 제공합니다.",
  "긴급 수리 및 야간 점검 가능합니다. 언제든 편하게 연락주세요.",
  "냉동공조 자격증 보유, 숙련된 기술로 완벽하게 수리해 드립니다.",
];

export default {
  async up(queryInterface) {
    const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

    // 1. User 테이블에서 role='ENGINEER' 조회 (대소문자 구분 주의)
    const [users] = await queryInterface.sequelize.query(
      `SELECT id, name FROM users WHERE role='ENGINEER' AND deleted_at IS NULL;`
    );

    if (!users || users.length === 0) {
      throw new Error("유저 테이블에 ENGINEER 역할을 가진 사용자가 없습니다.");
    }

    const engineerRows = users.map((user) => {
      // 숙련도에 따른 차별화 (랜덤이지만 MASTER는 좀 더 적게)
      const skillLevel = faker.helpers.weightedArrayElement([
        { value: "JUNIOR", weight: 3 },
        { value: "SENIOR", weight: 5 },
        { value: "MASTER", weight: 2 },
      ]);

      return {
        user_id: user.id,
        skill_level: skillLevel,
        // 📌 [야무진 로직] 한국어 전문 자기소개 삽입
        introduction: faker.helpers.arrayElement(KOREAN_INTRODUCTIONS),
        is_active: true,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };
    });

    await queryInterface.bulkInsert("engineers", engineerRows);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("engineers", null, {});
  },
};
