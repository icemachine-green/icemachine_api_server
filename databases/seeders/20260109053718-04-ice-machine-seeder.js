/**
 * @file databases/seeders/[timestamp]-04-ice-machine-seeder.js
 * @description 기존 브랜드+모델명 통합 포맷을 유지하는 제빙기 시더
 */
import { faker } from "@faker-js/faker";
import dayjs from "dayjs";

// 기존에 사용하시던 포맷 그대로 유지 (브랜드 + 모델명)
const MODEL_NAMES = [
  "Hoshizaki IM-45NE",
  "Hoshizaki IM-65NE",
  "Hoshizaki IM-100C",
  "Manitowoc UDF0140A",
  "Scotsman AC 106",
  "Brema CB 425",
  "Icetro LIM-050",
  "Icetro LIM-100",
  "모델명 모름", // 현장감을 위해 유지
];

// 사이즈는 서비스 단가 산정을 위해 명확한 값으로만 구성
const SIZE_TYPES = ["소형", "중형", "대형"];

export default {
  async up(queryInterface) {
    const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

    // 1. 매장 리스트 조회
    const [businesses] = await queryInterface.sequelize.query(
      `SELECT id FROM businesses WHERE deleted_at IS NULL;`
    );

    if (!businesses || businesses.length === 0) {
      throw new Error("매장(Business) 데이터를 먼저 생성해야 합니다.");
    }

    const iceMachines = [];

    for (const business of businesses) {
      // 업체당 1~2대의 제빙기 배치
      const count = Math.floor(Math.random() * 2) + 1;

      for (let i = 0; i < count; i++) {
        iceMachines.push({
          business_id: business.id,
          // 기존 DB 구조 유지
          model_type: "기본형",
          size_type: faker.helpers.arrayElement(SIZE_TYPES),
          model_name: faker.helpers.arrayElement(MODEL_NAMES),
          model_pic: null,
          created_at: now,
          updated_at: now,
          deleted_at: null,
        });
      }
    }

    await queryInterface.bulkInsert("ice_machines", iceMachines);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("ice_machines", null, {});
  },
};
