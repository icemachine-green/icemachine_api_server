/**
 * @file databases/migrations/20251216-03-create-schedule-photos.js
 * @description 'schedule_photos' 테이블 생성 마이그레이션
 * 251216 v1.0.0 Lee init
 */
import { DataTypes } from "sequelize";

const tableName = "schedule_photos";

const attributes = {
  id: {
    field: "id",
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "사진 고유 식별자",
  },
  schedule_id: {
    field: "schedule_id",
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "schedules",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE", // If a schedule is deleted, its photos should also be deleted
    comment: "예약 ID",
  },
  photo_url: {
    field: "photo_url",
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: "사진 URL",
  },
  type: {
    field: "type",
    type: DataTypes.ENUM("BEFORE", "AFTER"),
    allowNull: false,
    comment: "사진 종류",
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
