/**
 * @file databases/migrations/20260101-create-engineer-shifts.js
 * @description 'engineer_shifts' 테이블 생성 (모델 EngineerShift.js와 일치화)
 * 260101 v1.0.1 Lee-update
 */
import { DataTypes } from "sequelize";

const tableName = "engineer_shifts";

const attributes = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "근무 시간 PK",
  },
  engineer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "engineers", // Engineers 테이블 PK 참조
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    comment: "Engineers 테이블 PK 참조 (외래키)",
  },
  available_date: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "요일 (0=일요일, 6=토요일)",
  },
  shift_start: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: "근무 시작 시간",
  },
  shift_end: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: "근무 종료 시간",
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
