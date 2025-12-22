/**
 * @file databases/migrations/20251222053027-create-ice-machines.js
 * @description 'ice_machines' 테이블 생성 마이그레이션
 * 251222 v1.0.0 Lee-init
 */
import { DataTypes } from "sequelize";

const tableName = "ice_machines";

const attributes = {
  id: {
    field: "id",
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "제빙기 PK",
  },
  user_id: {
    field: "user_id",
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "Users 테이블의 PK (외래키)",
    references: {
      model: 'users', // 'users' 테이블을 참조
      key: 'id',      // 'users' 테이블의 'id' 컬럼을 참조
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE', // 사용자 삭제 시 제빙기 정보도 함께 삭제
  },
  model_type: {
    field: "model_type",
    type: DataTypes.STRING,
    allowNull: false,
    comment: "'옵션선택값' | '모름' | '기타'",
  },
  size_type: {
    field: "size_type",
    type: DataTypes.STRING,
    allowNull: false,
    comment: "'소형' | '중형' | '대형' | '모름' | '기타'",
  },
  model_name: {
    field: "model_name",
    type: DataTypes.STRING,
    allowNull: false,
    comment: "기타 입력 or 실제 모델명 or 모름",
  },
  model_pic: {
    field: "model_pic",
    type: DataTypes.STRING,
    allowNull: true,
    comment: "모델 사진 URL",
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