/**
 * @file databases/migrations/20251222052911-create-engineers.js
 * @description 'engineers' 테이블 생성 마이그레이션
 * 251222 v1.0.0 Lee-init
 */
import { DataTypes } from "sequelize";

const tableName = "engineers";

const attributes = {
  user_id: {
    field: "user_id",
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    comment: "Users 테이블의 PK (외래키)",
    references: {
      model: 'users', // 'users' 테이블을 참조
      key: 'id',      // 'users' 테이블의 'id' 컬럼을 참조
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE', // Users에서 기사 계정 삭제 시 기사 프로필도 함께 삭제
  },
  skill_level: {
    field: "skill_level",
    type: DataTypes.ENUM('JUNIOR', 'SENIOR', 'MASTER'),
    allowNull: false,
    defaultValue: 'JUNIOR',
    comment: "기사 기술 등급",
  },
  introduction: {
    field: "introduction",
    type: DataTypes.TEXT,
    allowNull: true,
    comment: "고객에게 노출되는 기사 소개글",
  },
  is_active: {
    field: "is_active",
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: "현재 배정 가능한 상태인지 여부",
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