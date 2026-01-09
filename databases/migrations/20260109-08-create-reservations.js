/**
 * @file databases/migrations/20251222053124-create-reservations.js
 * @description 'reservations' 테이블 생성 (모델 Reservation.js와 일치화)
 * 251222 v1.0.1 Lee-update
 */
import { DataTypes } from "sequelize";

const tableName = "reservations";

const attributes = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "예약 PK",
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "users", key: "id" },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    comment: "고객 (users.id)",
  },
  business_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "businesses", key: "id" },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    comment: "업체 (businesses.id)",
  },
  engineer_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // 배정 전일 수 있음
    references: { model: "engineers", key: "id" },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
    comment: "기사 (engineers.id)",
  },
  ice_machine_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "ice_machines", key: "id" },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    comment: "제빙기 (ice_machines.id)",
  },
  service_policy_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "service_policies", key: "id" },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    comment: "서비스 정책 (service_policies.id)",
  },
  reserved_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: "예약 날짜",
  },
  service_start_time: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: "서비스 시작 시간",
  },
  service_end_time: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: "서비스 종료 시간",
  },
  status: {
    type: DataTypes.ENUM(
      "PENDING",
      "CONFIRMED",
      "START",
      "COMPLETED",
      "CANCELED"
    ),
    allowNull: false,
    defaultValue: "PENDING",
    comment: "예약 상태",
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
