import { faker } from "@faker-js/faker";
import dayjs from "dayjs";

// 010-####-#### 형식
const generatePhoneNumber = () => {
  const middle = Math.floor(1000 + Math.random() * 9000);
  const last = Math.floor(1000 + Math.random() * 9000);
  return `010-${middle}-${last}`;
};

// 한국식 이름 생성
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

// 대구 지역 주소 생성
const generateAddress = () => {
  const districts = [
    "중구",
    "동구",
    "서구",
    "남구",
    "북구",
    "수성구",
    "달서구",
    "달성군",
  ];
  const streetNum = Math.floor(Math.random() * 1000) + 1;
  return `대구광역시 ${faker.helpers.arrayElement(districts)} ${streetNum}번길`;
};

// Business 생성
const generateBusinesses = (customers) => {
  const businesses = [];

  for (const user of customers) {
    const numOfBusinesses = Math.floor(Math.random() * 3) + 1; // 1~3개
    for (let i = 0; i < numOfBusinesses; i++) {
      businesses.push({
        user_id: user.id,
        name: faker.company.name(),
        main_address: generateAddress(),
        detailed_address: `${Math.floor(Math.random() * 5) + 1}층`,
        manager_name: generateKoreanName(),
        phone_number: generatePhoneNumber(),
        created_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        updated_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        deleted_at: null,
      });
    }
  }

  return businesses;
};

export default {
  async up(queryInterface) {
    // User 테이블에서 role='customer' 조회
    const [customers] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role='customer' AND deleted_at IS NULL;`
    );

    if (!customers || customers.length === 0) {
      throw new Error("No customers found. Please run User seed first.");
    }

    const businesses = generateBusinesses(customers);
    await queryInterface.bulkInsert("businesses", businesses);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("businesses", null, {});
  },
};
