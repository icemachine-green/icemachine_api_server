/**
 * @file databases/migrations/20251216-04-create-reviews.js
 * @description 'reviews' 테이블 생성 마이그레이션
 * 251216 v1.0.0 Lee init
 */
import { DataTypes } from "sequelize";

const tableName = "reviews";

const attributes = {
  id: {
    field: "id",
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "리뷰 고유 식별자",
  },
  schedule_id: {
    field: "schedule_id",
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // Assuming one review per schedule
    references: {
      model: "schedules",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE", // If a schedule is deleted, its review should also be deleted
    comment: "예약 ID",
  },
  customer_id: {
    field: "customer_id",
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE", // If customer is deleted, review can remain with null customer_id
    comment: "리뷰 작성 고객 ID",
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
    onDelete: "CASCADE", // If engineer is deleted, review can remain with null engineer_id
    comment: "리뷰 대상 엔지니어 ID",
  },
  rating: {
    field: "rating",
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "평점 (1~5)",
  },
  comment: {
    field: "comment",
    type: DataTypes.TEXT,
    allowNull: true,
    comment: "리뷰 내용",
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
