/**
 * @file databases/migrations/20251222040721-create-users.js
 * @description 'users' 테이블 생성 마이그레이션
 * 251222 v1.0.0 Lee-init
 */
import { DataTypes } from "sequelize";

const tableName = "users";

const attributes = {
  id: {
    field: "id",
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "유저 PK",
  },
  social_id: {
    field: "social_id",
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: "소셜 로그인 ID",
  },
  email: {
    field: "email",
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: "카카오 이메일",
  },
  provider: {
    field: "provider",
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: "로그인 제공자 ('kakao')",
  },
  name: {
    field: "name",
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: "사용자 이름",
  },
  phone_number: {
    field: "phone_number",
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: "연락처",
  },
  address: {
    field: "address",
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: "주소",
  },
  role: {
    field: "role",
    type: DataTypes.ENUM("customer", "engineer", "admin"),
    allowNull: false,
    defaultValue: "customer",
    comment: "유저 권한(customer, engineer, admin)",
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