/**
 * @file databases/migrations/20251222040721-create-users.js
 * @description 'users' 테이블 생성 마이그레이션 (모델 User.js와 일치화)
 * 251222 v1.0.1 Lee-update
 */
import { DataTypes } from "sequelize";

const tableName = "users";

/**
 * 모델 User.js의 attributes와 1:1 대응하도록 수정
 * 1. address 제거 (Business로 이동)
 * 2. role에서 admin 제거 (별도 테이블 존재)
 * 3. refresh_token 추가
 */
const attributes = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "유저 PK",
  },
  social_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: "소셜 로그인 ID",
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: "카카오 이메일",
  },
  provider: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: "로그인 제공자 ('kakao')",
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: "사용자 이름",
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: "연락처",
  },
  refresh_token: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: "리프레시 토큰",
  },
  role: {
    type: DataTypes.ENUM("customer", "engineer"),
    allowNull: false,
    defaultValue: "customer",
    comment: "유저 권한(customer, engineer)",
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
