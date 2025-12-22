/**
 * @file databases/migrations/20251222053250-create-reviews.js
 * @description 'reviews' 테이블 생성 마이그레이션
 * 251222 v1.0.0 Lee-init
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
    comment: "리뷰 PK",
  },
  user_id: {
    field: "user_id",
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "Users 테이블의 PK (외래키)",
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  rating: {
    field: "rating",
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: "별점 (1~5)",
  },
  quick_option: {
    field: "quick_option",
    type: DataTypes.STRING,
    allowNull: true,
    comment: "빠른 선택지 (예: 친절해요)",
  },
  content: {
    field: "content",
    type: DataTypes.TEXT,
    allowNull: true,
    comment: "리뷰 내용",
  },
  image_url: {
    field: "image_url",
    type: DataTypes.STRING,
    allowNull: true,
    comment: "리뷰 사진 URL",
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