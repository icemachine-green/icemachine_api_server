import { faker } from "@faker-js/faker";
import dayjs from "dayjs";

const MODEL_TYPES = ["옵션선택값", "모름", "기타"];
const SIZE_TYPES = ["소형", "중형", "대형", "모름", "기타"];

const MODEL_NAMES = [
  "Hoshizaki IM-65",
  "Hoshizaki IM-100",
  "Manitowoc UDF0140A",
  "Scotsman AC 106",
  "Brema CB 425",
  "모델명 모름",
];

const generateIceMachines = (businesses) => {
  const iceMachines = [];

  for (const business of businesses) {
    const count = Math.floor(Math.random() * 3) + 1; // 업체당 1~3대

    for (let i = 0; i < count; i++) {
      iceMachines.push({
        business_id: business.id,
        model_type: faker.helpers.arrayElement(MODEL_TYPES),
        size_type: faker.helpers.arrayElement(SIZE_TYPES),
        model_name: faker.helpers.arrayElement(MODEL_NAMES),
        model_pic: null,
        created_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        updated_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        deleted_at: null,
      });
    }
  }

  return iceMachines;
};

export default {
  async up(queryInterface) {
    // businesses 조회
    const [businesses] = await queryInterface.sequelize.query(
      `SELECT id FROM businesses WHERE deleted_at IS NULL;`
    );

    if (!businesses || businesses.length === 0) {
      throw new Error("No businesses found. Please run Business seed first.");
    }

    const iceMachines = generateIceMachines(businesses);
    await queryInterface.bulkInsert("ice_machines", iceMachines);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("ice_machines", null, {});
  },
};
