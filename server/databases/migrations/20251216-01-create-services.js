/**
 * @file databases/migrations/20251216-01-create-services.js
 * @description 'services' 테이블 생성 마이그레이션
 * 251216 v1.0.0 Lee init
 */
import { DataTypes } from "sequelize";

const tableName = "services";

const attributes = {
  id: {
    field: "id",
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "서비스 고유 식별자",
  },
  name: {
    field: "name",
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: "서비스 이름 (예: 딥클린)",
  },
  description: {
    field: "description",
    type: DataTypes.TEXT,
    allowNull: true,
    comment: "서비스 상세 설명",
  },
  duration_hours: {
    field: "duration_hours",
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "예상 소요 시간",
  },
  base_price: {
    field: "base_price",
    type: DataTypes.DECIMAL,
    allowNull: false,
    comment: "기본 가격",
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
  deletedAt: {
    field: "deleted_at",
    type: DataTypes.DATE,
    allowNull: true,
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
