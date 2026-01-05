/**
 * @file databases/migrations/20260101-create-engineers.js
 * @description 'engineers' 테이블 생성 마이그레이션
 * 260101 v1.0.0
 */
import { DataTypes } from "sequelize";

const tableName = "engineers";

const attributes = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "Engineers 테이블 PK",
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    comment: "Users 테이블 PK (외래키)",
    references: {
      model: "users",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  skill_level: {
    type: DataTypes.ENUM("JUNIOR", "SENIOR", "MASTER"),
    allowNull: false,
    defaultValue: "JUNIOR",
    comment: "기사 기술 등급",
  },
  introduction: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: "고객에게 노출되는 기사 소개글",
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: "현재 배정 가능한 상태인지 여부",
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
  tableName,
  charset: "utf8mb4",
  collate: "utf8mb4_unicode_ci",
  engine: "InnoDB",
  timestamps: true,
  paranoid: true,
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
