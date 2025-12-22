/**
 * @file databases/migrations/20251222052741-create-admins.js
 * @description 'admins' 테이블 생성 마이그레이션
 * 251222 v1.0.0 Lee-init
 */
import { DataTypes } from "sequelize";

const tableName = "admins";

const attributes = {
  id: {
    field: "id",
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "관리자 PK",
  },
  username: {
    field: "username",
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: "로그인 아이디",
  },
  password_hash: {
    field: "password_hash",
    type: DataTypes.STRING,
    allowNull: false,
    comment: "해시된 비밀번호",
  },
  name: {
    field: "name",
    type: DataTypes.STRING,
    allowNull: false,
    comment: "관리자 실명",
  },
  role: {
    field: "role",
    type: DataTypes.ENUM('SUPER_ADMIN', 'ADMIN'),
    allowNull: false,
    comment: "관리자 권한",
  },
  is_active: {
    field: "is_active",
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: "계정 활성/비활성 여부",
  },
  last_login_at: {
    field: "last_login_at",
    type: DataTypes.DATE,
    allowNull: true,
    comment: "마지막 로그인 시간",
  },
  last_login_ip: {
    field: "last_login_ip",
    type: DataTypes.STRING,
    allowNull: true,
    comment: "마지막 로그인 IP",
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