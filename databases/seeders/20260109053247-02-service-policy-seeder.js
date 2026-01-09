/**
 * @file databases/seeders/[timestamp]-02-service-policy-seeder.js
 * @description service_policies 초기 데이터 시드
 */
import dayjs from "dayjs";

export default {
  async up(queryInterface) {
    const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

    const servicePolicies = [
      // 소형
      {
        size_type: "소형",
        service_type: "VISIT_CHECK",
        standard_duration: 60,
        description: "소형 제빙기 방문 점검",
        created_at: now,
        updated_at: now,
      },
      {
        size_type: "소형",
        service_type: "STANDARD_CLEAN",
        standard_duration: 60,
        description: "소형 제빙기 기본 청소",
        created_at: now,
        updated_at: now,
      },
      {
        size_type: "소형",
        service_type: "DEEP_CLEAN",
        standard_duration: 120,
        description: "소형 제빙기 집중 청소",
        created_at: now,
        updated_at: now,
      },

      // 중형
      {
        size_type: "중형",
        service_type: "VISIT_CHECK",
        standard_duration: 60,
        description: "중형 제빙기 방문 점검",
        created_at: now,
        updated_at: now,
      },
      {
        size_type: "중형",
        service_type: "STANDARD_CLEAN",
        standard_duration: 60,
        description: "중형 제빙기 기본 청소",
        created_at: now,
        updated_at: now,
      },
      {
        size_type: "중형",
        service_type: "DEEP_CLEAN",
        standard_duration: 120,
        description: "중형 제빙기 집중 청소",
        created_at: now,
        updated_at: now,
      },
      {
        size_type: "중형",
        service_type: "PREMIUM_CLEAN",
        standard_duration: 180,
        description: "중형 제빙기 프리미엄 청소",
        created_at: now,
        updated_at: now,
      },

      // 대형
      {
        size_type: "대형",
        service_type: "VISIT_CHECK",
        standard_duration: 60,
        description: "대형 제빙기 방문 점검",
        created_at: now,
        updated_at: now,
      },
      {
        size_type: "대형",
        service_type: "STANDARD_CLEAN",
        standard_duration: 120,
        description: "대형 제빙기 기본 청소",
        created_at: now,
        updated_at: now,
      },
      {
        size_type: "대형",
        service_type: "DEEP_CLEAN",
        standard_duration: 180,
        description: "대형 제빙기 집중 청소",
        created_at: now,
        updated_at: now,
      },
      {
        size_type: "대형",
        service_type: "PREMIUM_CLEAN",
        standard_duration: 240,
        description: "대형 제빙기 프리미엄 청소",
        created_at: now,
        updated_at: now,
      },
    ];

    await queryInterface.bulkInsert("service_policies", servicePolicies);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("service_policies", null, {});
  },
};
