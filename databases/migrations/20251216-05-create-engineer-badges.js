/**
 * @file databases/migrations/20251216-05-create-engineer-badges.js
 * @description 'engineer_badges' 테이블 생성 마이그레이션
 * 251216 v1.0.0 Lee init
 */
import { DataTypes } from "sequelize";

const tableName = "engineer_badges";

const attributes = {
  id: {
    field: "id",
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "칭호 획득 ID",
  },
  engineer_id: {
    field: "engineer_id",
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE", // If an engineer is deleted, their badges should also be deleted
    comment: "엔지니어 ID",
  },
  badge_type: {
    field: "badge_type",
    type: DataTypes.ENUM("ALL_ROUNDER", "KINDNESS", "METICULOUS", "NEATNESS", "SPEED"),
    allowNull: false,
    comment: "칭호 종류",
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
