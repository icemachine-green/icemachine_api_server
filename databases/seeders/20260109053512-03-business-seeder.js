/**
 * @file databases/seeders/[timestamp]-03-business-seeder.js
 * @description 대구 핫플레이스 감성을 담은 리얼한 매장명 시드
 */
import { faker } from "@faker-js/faker";
import dayjs from "dayjs";

const generatePhoneNumber = () => {
  return `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;
};

// 매장명 생성 로직 (리얼리티 극대화)
const generateBusinessName = () => {
  const brandNames = [
    // 감성 카페 & 베이커리
    "오브느",
    "스테이웜",
    "먼데이오프",
    "노스텔지어",
    "딥커피로스터스",
    "데우스",
    "슬로우터틀",
    "커피바스켓",
    "모어닝글로리",
    "레이지모닝",
    "아뜰리에빈",
    "코너스톤",
    "빌리웍스",
    "나인블록",
    "핸즈커피",
    "루시드",
    // 힙한 식당 & 펍
    "소호다이닝",
    "피키차일드다이닝",
    "단골손님",
    "동성로쭈꾸미",
    "고담2015",
    "토요정",
    "해쉬",
    "미란다키친",
    "쿠킹차차",
    "동양백반",
    "온기정",
    "오이시민",
    "삼덕비빔국수",
    "호목",
    "심야오뎅",
    "꿀빵",
  ];

  const descriptors = [
    "더",
    "어반",
    "오리지널",
    "클래식",
    "프라이빗",
    "내추럴",
    "데일리",
    "리얼",
  ];
  const categories = [
    "카페",
    "커피",
    "베이커리",
    "다이닝",
    "키친",
    "스튜디오",
    "로스터즈",
    "공방",
    "포차",
    "상회",
  ];
  const locations = [
    "동성로",
    "삼덕",
    "범어",
    "앞산",
    "교동",
    "대명",
    "황금",
    "침산",
    "수성",
  ];

  const rand = Math.random();

  if (rand < 0.25) {
    // 1. 고유 브랜드 스타일 (예: 딥커피로스터스 삼덕점)
    return `${faker.helpers.arrayElement(
      brandNames
    )} ${faker.helpers.arrayElement(locations)}점`;
  } else if (rand < 0.5) {
    // 2. 감성 조합 스타일 (예: 스테이웜 베이커리)
    return `${faker.helpers.arrayElement(
      brandNames
    )} ${faker.helpers.arrayElement(categories)}`;
  } else if (rand < 0.75) {
    // 3. 형용사 + 카테고리 (예: 어반 키친 대구본점)
    return `${faker.helpers.arrayElement(
      descriptors
    )} ${faker.helpers.arrayElement(categories)} ${faker.helpers.arrayElement([
      "본점",
      "대구점",
      "",
    ])}`.trim();
  } else {
    // 4. 완전 영어 힙스터 스타일 (예: DEUS COFFEE ROASTERS)
    const engNames = [
      "ROUTINE",
      "OBJECT",
      "ARCHIVE",
      "RECORD",
      "NOMAD",
      "BLANK",
      "MOOD",
      "SENSE",
    ];
    const engTypes = ["COFFEE", "ROASTERS", "DINING", "STUDIO", "LAB"];
    return `${faker.helpers.arrayElement(
      engNames
    )} ${faker.helpers.arrayElement(engTypes)}`;
  }
};

const generateAddress = () => {
  const addrData = [
    { d: "중구", s: ["삼덕동", "동성로", "교동", "대봉동"] },
    { d: "수성구", s: ["범어동", "황금동", "두산동", "만촌동"] },
    { d: "남구", s: ["대명동", "봉덕동"] },
    { d: "북구", s: ["침산동", "산격동", "복현동"] },
    { d: "달서구", s: ["상인동", "두류동", "월성동"] },
  ];
  const selected = faker.helpers.arrayElement(addrData);
  const streetNum = faker.number.int({ min: 1, max: 250 });
  return `대구광역시 ${selected.d} ${faker.helpers.arrayElement(
    selected.s
  )} ${streetNum}번길`;
};

export default {
  async up(queryInterface) {
    const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

    const [customers] = await queryInterface.sequelize.query(
      `SELECT id, name FROM users WHERE role='customer' AND deleted_at IS NULL;`
    );

    if (!customers || customers.length === 0)
      throw new Error("고객 데이터를 먼저 생성하세요.");

    const businesses = [];
    for (const user of customers) {
      const numOfBusinesses = Math.floor(Math.random() * 2) + 1;

      for (let i = 0; i < numOfBusinesses; i++) {
        let businessName = generateBusinessName();

        // 📌 [이태호 사장님 특별 관리] 리얼리티 100% 반영
        if (user.name === "이태호") {
          businessName =
            i === 0
              ? "태호네 딥커피로스터즈 (본점)"
              : "이태호의 소호다이닝 교동점";
        }

        businesses.push({
          user_id: user.id,
          name: businessName,
          main_address: generateAddress(),
          detailed_address: `${faker.number.int({ min: 1, max: 5 })}층`,
          manager_name: user.name,
          phone_number: generatePhoneNumber(),
          created_at: now,
          updated_at: now,
          deleted_at: null,
        });
      }
    }
    await queryInterface.bulkInsert("businesses", businesses);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("businesses", null, {});
  },
};
