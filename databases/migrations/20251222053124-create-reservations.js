/**
 * @file databases/migrations/20251222053124-create-reservations.js
 * @description 'reservations' 테이블 생성 마이그레이션
 * 251222 v1.0.0 Lee-init
 */
import { DataTypes } from "sequelize";

const tableName = "reservations";

const attributes = {
  id: {
    field: "id",
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "예약 PK",
  },
  user_id: {
    field: "user_id",
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "Users 테이블의 PK (외래키)",
    references: {
      model: "users",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  engineer_id: {
    field: "engineer_id",
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: "Engineers 테이블의 PK (외래키)",
    references: {
      model: "engineers",
      key: "id", // PK 기준
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  },
  ice_machine_id: {
    field: "ice_machine_id",
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "IceMachines 테이블의 PK (외래키)",
    references: {
      model: "ice_machines",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  service_policy_id: {
    field: "service_policy_id",
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "ServicePolicies 테이블의 PK (외래키)",
    references: {
      model: "service_policies",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  reserved_date: {
    field: "reserved_date",
    type: DataTypes.DATEONLY, // YYYY-MM-DD 형식
    allowNull: false,
    comment: "예약 날짜",
  },
  service_start_time: {
    field: "service_start_time",
    type: DataTypes.DATE, // 전체 시간 정보 포함
    allowNull: false,
    comment: "서비스 시작 시간",
  },
  service_end_time: {
    field: "service_end_time",
    type: DataTypes.DATE, // 전체 시간 정보 포함
    allowNull: false,
    comment: "서비스 종료 시간",
  },
  status: {
    field: "status",
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
