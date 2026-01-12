/**
 * @file databases/migrations/20251222041000-create-businesses.js
 * @description 'businesses' 테이블 생성 (모델 Business.js와 일치화)
 * 251224 v1.0.1 Taeho-update
 */
import { DataTypes } from "sequelize";

const tableName = "businesses";

const attributes = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "업체 PK",
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    comment: "소유주 (users.id)",
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: "업체명",
  },
  main_address: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: "기본 주소",
  },
  detailed_address: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: "상세 주소",
  },
  manager_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: "담당자 이름",
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: "업체 연락처",
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  deleted_at: {
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
