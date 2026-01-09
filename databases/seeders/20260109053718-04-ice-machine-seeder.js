/**
 * @file databases/seeders/20260110000002-ice-machine-seeder.js
 * @description 브랜드와 모델명을 자동 분리하여 모델 구조(model_type 제거)에 맞춘 시더
 */
import { faker } from "@faker-js/faker";
import dayjs from "dayjs";

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

    // 2. 기존 포맷에서 브랜드와 모델명을 추출하기 위한 맵핑
    const RAW_MODELS = [
      { brand: "Hoshizaki", model: "IM-45NE" },
      { brand: "Hoshizaki", model: "IM-65NE" },
      { brand: "Hoshizaki", model: "IM-100C" },
      { brand: "Manitowoc", model: "UDF0140A" },
      { brand: "Scotsman", model: "AC 106" },
      { brand: "Brema", model: "CB 425" },
      { brand: "Icetro", model: "LIM-050" },
      { brand: "Icetro", model: "LIM-100" },
      { brand: "기타", model: "모델명 모름" },
    ];

    const SIZE_TYPES = ["소형", "중형", "대형"];
    const iceMachines = [];

    for (const business of businesses) {
      // 매장당 1~2대의 제빙기 배치
      const count = Math.floor(Math.random() * 2) + 1;

      for (let i = 0; i < count; i++) {
        const selected = faker.helpers.arrayElement(RAW_MODELS);

        iceMachines.push({
          business_id: business.id,
          // 🚩 모델에 정의된 대로 brand_name과 model_name을 나누어 저장
          brand_name: selected.brand,
          model_name: selected.model,
          size_type: faker.helpers.arrayElement(SIZE_TYPES),
          model_pic: null,
          created_at: now,
          updated_at: now,
          deleted_at: null,
        });
      }
    }

    await queryInterface.bulkInsert("ice_machines", iceMachines);
    console.log(
      `✅ 총 ${iceMachines.length}대의 제빙기가 브랜드/모델 분리형으로 등록되었습니다.`
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("ice_machines", null, {});
  },
};
