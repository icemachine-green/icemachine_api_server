/**
 * @file databases/migrations/20260101-create-engineer-shifts.js
 * @description 'engineer_shifts' 테이블 생성 마이그레이션
 * 260101 v1.0.0
 */
import { DataTypes } from "sequelize";

const tableName = "engineer_shifts";

const attributes = {
  id: {
    field: "id",
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "근무 시간 PK",
  },
  engineer_id: {
    field: "engineer_id",
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "Engineers 테이블 PK 참조 (외래키)",
    references: {
      model: "engineers",
      key: "id", // 이제 Engineer.id를 참조
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE", // 엔지니어 삭제 시 근무 시간도 함께 삭제
  },
  available_date: {
    field: "available_date",
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "요일 (0=일요일, 6=토요일)",
  },
  shift_start: {
    field: "shift_start",
    type: DataTypes.TIME,
    allowNull: false,
    comment: "근무 시작 시간",
  },
  shift_end: {
    field: "shift_end",
    type: DataTypes.TIME,
    allowNull: false,
    comment: "근무 종료 시간",
  },
  created_at: {
    field: "created_at",
    type: DataTypes.DATE,
    allowNull: false,
  },
  updated_at: {
    field: "updated_at",
    type: DataTypes.DATE,
    allowNull: false,
  },
  deleted_at: {
    field: "deleted_at",
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
