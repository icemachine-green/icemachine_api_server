/**
 * @file databases/migrations/20251222053321-create-schedule-photos.js
 * @description 'schedule_photos' 테이블 생성 마이그레이션
 * 251222 v1.0.0 Lee-init
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
    comment: "스케줄 사진 PK",
  },
  reservation_id: {
    field: "reservation_id",
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "Reservations 테이블의 PK (외래키)",
    references: {
      model: 'reservations',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  image_url: {
    field: "image_url",
    type: DataTypes.STRING,
    allowNull: false,
    comment: "사진 URL",
  },
  photo_type: {
    field: "photo_type",
    type: DataTypes.ENUM('BEFORE', 'AFTER', 'ISSUE'),
    allowNull: false,
    defaultValue: 'BEFORE',
    comment: "사진 유형 ('BEFORE', 'AFTER', 'ISSUE')",
  },
  description: {
    field: "description",
    type: DataTypes.TEXT,
    allowNull: true,
    comment: "사진 설명",
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