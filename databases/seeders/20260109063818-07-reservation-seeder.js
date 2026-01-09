/**
 * @file databases/seeders/20251231-07-reservation-seeder.js
 */
import dayjs from "dayjs";
import { faker } from "@faker-js/faker";

export default {
  async up(queryInterface, Sequelize) {
    // 1. 기초 데이터 로드
    const [users] = await queryInterface.sequelize.query(`
      SELECT id FROM users WHERE role = 'customer' AND deleted_at IS NULL
    `);

    // [중요 수정] engineer_id로 쓸 고유 PK 'id'를 조회합니다.
    const [engineers] = await queryInterface.sequelize.query(`
      SELECT id FROM engineers WHERE deleted_at IS NULL
    `);

    const [businesses] = await queryInterface.sequelize.query(`
      SELECT id, user_id FROM businesses WHERE deleted_at IS NULL
    `);

    const [iceMachines] = await queryInterface.sequelize.query(`
      SELECT id, business_id FROM ice_machines WHERE deleted_at IS NULL
    `);

    const [servicePolicies] = await queryInterface.sequelize.query(`
      SELECT id, standard_duration FROM service_policies
    `);

    const reservations = [];
    const now = dayjs();

    // 2. 데이터 생성
    for (let i = 0; i < 1200; i++) {
      const business = faker.helpers.arrayElement(businesses);
      const customer = users.find((u) => u.id === business.user_id);
      if (!customer) continue;

      const machine = iceMachines.find((m) => m.business_id === business.id);
      if (!machine) continue;

      const policy = faker.helpers.arrayElement(servicePolicies);

      const reservedDate = now
        .add(faker.number.int({ min: -7, max: 14 }), "day")
        .startOf("day");

      const startHour = faker.number.int({ min: 9, max: 17 });
      const serviceStart = reservedDate.hour(startHour).minute(0).second(0);
      const serviceEnd = serviceStart.add(policy.standard_duration, "minute");

      const assignEngineer = Math.random() < 0.35;
      const engineer = assignEngineer
        ? faker.helpers.arrayElement(engineers)
        : null;

      reservations.push({
        user_id: customer.id,
        business_id: business.id,
        // [중요 수정] 이제 engineer.id는 Engineers 테이블의 고유 PK입니다.
        engineer_id: engineer ? engineer.id : null,
        ice_machine_id: machine.id,
        service_policy_id: policy.id,
        reserved_date: reservedDate.format("YYYY-MM-DD"),
        service_start_time: serviceStart.format("YYYY-MM-DD HH:mm:ss"),
        service_end_time: serviceEnd.format("YYYY-MM-DD HH:mm:ss"),
        status: assignEngineer ? "CONFIRMED" : "PENDING",
        created_at: now.format("YYYY-MM-DD HH:mm:ss"),
        updated_at: now.format("YYYY-MM-DD HH:mm:ss"),
        deleted_at: null,
      });
    }

    if (reservations.length > 0) {
      await queryInterface.bulkInsert("reservations", reservations);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("reservations", null, {});
  },
};
