/**
 * @file databases/migrations/20260109000001-create-service-policies.js
 * @description 서비스 정책 테이블 (한국어 ENUM 및 1시간 단위 슬롯 반영)
 */
import { DataTypes } from "sequelize";

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("service_policies", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      size_type: {
        // 🚩 한국어 ENUM 적용
        type: DataTypes.ENUM("소형", "중형", "대형"),
        allowNull: false,
      },
      service_type: {
        // 🚩 4글자 한국어 서비스명 통일
        type: DataTypes.ENUM("방문점검", "기본청소", "집중청소", "프리미엄"),
        allowNull: false,
      },
      standard_duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "작업 소요 시간 (분 단위, 60의 배수)",
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      note: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "프론트엔드 노출용 서비스 요약",
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "내부 관리용 상세 설명",
      },
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("service_policies");
  },
};
