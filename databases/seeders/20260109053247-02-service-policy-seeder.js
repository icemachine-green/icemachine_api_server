/**
 * @file databases/seeders/20260109000001-service-policy-seeder.js
 * @description 사이즈 및 서비스 종류별 소요시간, 노트, 가격 자동 맵핑 시더
 */
import dayjs from "dayjs";

export default {
  async up(queryInterface) {
    const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

    const servicePolicies = [
      // --- 소형 제빙기 ---
      {
        size_type: "소형",
        service_type: "방문점검",
        standard_duration: 60,
        price: 33000,
        note: "기본 작동 상태 및 핵심 부품 정밀 점검",
        description: "소형 방문점검 (1슬롯)",
        created_at: now,
        updated_at: now,
      },
      {
        size_type: "소형",
        service_type: "기본청소",
        standard_duration: 60,
        price: 88000,
        note: "필터 세척 및 내부 살균 소독 서비스",
        description: "소형 기본청소 (1슬롯)",
        created_at: now,
        updated_at: now,
      },
      {
        size_type: "소형",
        service_type: "집중청소",
        standard_duration: 120,
        price: 154000,
        note: "상부 분해 및 내부 물때·스케일 완벽 제거",
        description: "소형 집중청소 (2슬롯)",
        created_at: now,
        updated_at: now,
      },

      // --- 중형 제빙기 ---
      {
        size_type: "중형",
        service_type: "방문점검",
        standard_duration: 60,
        price: 44000,
        note: "냉동 시스템 및 에러 코드 정밀 진단",
        description: "중형 방문점검 (1슬롯)",
        created_at: now,
        updated_at: now,
      },
      {
        size_type: "중형",
        service_type: "기본청소",
        standard_duration: 120,
        price: 110000,
        note: "급·배수 라인 고압 세척 및 하우징 클리닝",
        description: "중형 기본청소 (2슬롯)",
        created_at: now,
        updated_at: now,
      },
      {
        size_type: "중형",
        service_type: "집중청소",
        standard_duration: 180,
        price: 187000,
        note: "완전 분해 후 부품별 약품 세척 및 살균",
        description: "중형 집중청소 (3슬롯)",
        created_at: now,
        updated_at: now,
      },
      {
        size_type: "중형",
        service_type: "프리미엄",
        standard_duration: 240,
        price: 253000,
        note: "집중 청소 + 소모품 교체 및 제빙 테스트",
        description: "중형 프리미엄 (4슬롯)",
        created_at: now,
        updated_at: now,
      },

      // --- 대형 제빙기 ---
      {
        size_type: "대형",
        service_type: "방문점검",
        standard_duration: 120,
        price: 55000,
        note: "대용량 콤프레셔 및 냉각 시스템 정밀 체크",
        description: "대형 방문점검 (2슬롯)",
        created_at: now,
        updated_at: now,
      },
      {
        size_type: "대형",
        service_type: "기본청소",
        standard_duration: 120,
        price: 132000,
        note: "대형 저장고 살균 및 배수 펌프 점검",
        description: "대형 기본청소 (2슬롯)",
        created_at: now,
        updated_at: now,
      },
      {
        size_type: "대형",
        service_type: "집중청소",
        standard_duration: 180,
        price: 220000,
        note: "대형 부품 분해 세척 및 고압 시스템 살균",
        description: "대형 집중청소 (3슬롯)",
        created_at: now,
        updated_at: now,
      },
      {
        size_type: "대형",
        service_type: "프리미엄",
        standard_duration: 240,
        price: 286000,
        note: "최상위 VIP 케어 : 항균 코팅 및 정밀 리포트",
        description: "대형 프리미엄 (4슬롯)",
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
