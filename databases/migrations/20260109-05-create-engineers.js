/**
 * @file databases/migrations/20260101-create-engineers.js
 * @description 'engineers' 테이블 생성 (모델 Engineer.js와 일치화)
 * 260101 v1.0.1 Lee-update
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
    references: {
      model: "users",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    comment: "Users 테이블 PK (외래키)",
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
