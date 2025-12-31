import { faker } from "@faker-js/faker";

/**
 * 휴대폰 번호 생성
 */
const generatePhoneNumber = () => {
  const middle = Math.floor(1000 + Math.random() * 9000);
  const last = Math.floor(1000 + Math.random() * 9000);
  return `010-${middle}-${last}`;
};

/**
 * 한국 이름 생성
 */
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

    // 고객
    for (let i = 0; i < CUSTOMER_COUNT; i++) {
      users.push({
        social_id: `kakao_customer_${faker.string.uuid()}`,
        email: faker.internet.email().toLowerCase(),
        provider: "kakao",
        name: generateKoreanName(),
        phone_number: generatePhoneNumber(),
        refresh_token: null,
        role: "customer",
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      });
    }

    // 기사
    for (let i = 0; i < ENGINEER_COUNT; i++) {
      users.push({
        social_id: `kakao_engineer_${faker.string.uuid()}`,
        email: faker.internet.email().toLowerCase(),
        provider: "kakao",
        name: generateKoreanName(),
        phone_number: generatePhoneNumber(),
        refresh_token: null,
        role: "engineer",
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      });
    }

    await queryInterface.bulkInsert("users", users);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
