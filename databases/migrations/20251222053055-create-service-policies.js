/**
 * @file databases/migrations/20251222053055-create-service-policies.js
 * @description 'service_policies' 테이블 생성 마이그레이션
 * 251222 v1.0.0 Lee-init
 */
import { DataTypes } from "sequelize";

const tableName = "service_policies";

const attributes = {
  id: {
    field: "id",
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "서비스 정책 PK",
  },
  size_type: {
    field: "size_type",
    type: DataTypes.STRING,
    allowNull: false,
    comment: "'소형' | '중형' | '대형'",
  },
  service_type: {
    field: "service_type",
    type: DataTypes.ENUM('VISIT_CHECK', 'STANDARD_CLEAN', 'DEEP_CLEAN', 'PREMIUM_CLEAN', 'SUBSCRIPTION'),
    allowNull: false,
    comment: "서비스 종류",
  },
  standard_duration: {
    field: "standard_duration",
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "작업 시간 (분 단위)",
  },
  description: {
    field: "description",
    type: DataTypes.STRING,
    allowNull: true,
    comment: "내부 설명용",
  },
  createdAt: {
    field: "created_at",
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    field: "updated_at",
    type: DataTypes.DATE,
    allowNull: false,
  },
};

const options = {
  charset: "utf8mb4",
  collate: "utf8mb4_unicode_ci",
  engine: "InnoDB",
};

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, attributes, options);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(tableName);
  },
};