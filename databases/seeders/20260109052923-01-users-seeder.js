/**
 * @file databases/seeders/20251231-02-users-seeder.js
 * @description users 테이블 초기 데이터 시드 (한국어 성함 및 휴대폰 포맷 적용)
 */
import { faker } from "@faker-js/faker";
import dayjs from "dayjs";

const generatePhoneNumber = () => {
  const middle = Math.floor(1000 + Math.random() * 9000);
  const last = Math.floor(1000 + Math.random() * 9000);
  return `010-${middle}-${last}`;
};

const LAST_NAMES = [
  "김",
  "이",
  "박",
  "최",
  "정",
  "강",
  "조",
  "윤",
  "장",
  "임",
  "한",
  "오",
  "서",
  "신",
  "권",
  "황",
  "안",
  "송",
  "류",
  "전",
];
const FIRST_NAMES = [
  "민수",
  "서연",
  "지훈",
  "지우",
  "하준",
  "도윤",
  "예준",
  "시우",
  "서준",
  "하은",
  "수빈",
  "예린",
  "현우",
  "지민",
  "유진",
  "서영",
  "태민",
  "정우",
  "수아",
  "나윤",
];

const generateKoreanName = () => {
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  return `${last}${first}`;
};

export default {
  async up(queryInterface) {
    const users = [];
    const CUSTOMER_COUNT = 1000;
    const ENGINEER_COUNT = 48;
    const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

    // 이메일 중복 방지를 위한 Set
    const emailSet = new Set();

    const generateUniqueEmail = () => {
      let email = faker.internet.email().toLowerCase();
      while (emailSet.has(email)) {
        email = faker.internet.email().toLowerCase();
      }
      emailSet.add(email);
      return email;
    };

    // 1. 고객 생성 (1000명)
    for (let i = 0; i < CUSTOMER_COUNT; i++) {
      users.push({
        social_id: `kakao_customer_${faker.string.uuid()}`,
        email: generateUniqueEmail(),
        provider: "kakao",
        name: generateKoreanName(),
        phone_number: generatePhoneNumber(),
        role: "customer",
        created_at: now,
        updated_at: now,
      });
    }

    // 2. 기사 생성 (48명)
    for (let i = 0; i < ENGINEER_COUNT; i++) {
      users.push({
        social_id: `kakao_engineer_${faker.string.uuid()}`,
        email: generateUniqueEmail(),
        provider: "kakao",
        name: generateKoreanName(),
        phone_number: generatePhoneNumber(),
        role: "engineer",
        created_at: now,
        updated_at: now,
      });
    }

    await queryInterface.bulkInsert("users", users);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
