/**
 * @file databases/migrations/20251215-01-create-users.js
 * @description 'users' 테이블 생성 마이그레이션
 * 251216 v1.0.0 Lee init
 */
import { DataTypes } from "sequelize";

// 테이블 명
const tableName = "users";

// 컬럼 정의
const attributes = {
  id: {
    field: "id",
    type: DataTypes.INTEGER, // 원본은 BIGINT.UNSIGNED 였으나, 새 프로젝트에서는 INTEGER로 통일
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "유저 PK",
  },
  email: {
    field: "email",
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  password: {
    field: "password",
    type: DataTypes.STRING(255),
    allowNull: true, // 소셜 로그인 시 NULL 허용
    comment: "비밀번호",
  },
  name: {
    field: "name",
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: "사용자 이름",
  },
  phone_number: {
    field: "phone_number",
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: "연락처",
  },
  role: {
    field: "role",
    type: DataTypes.ENUM("CUSTOMER", "ENGINEER", "ADMIN"),
    allowNull: false,
    defaultValue: "CUSTOMER",
    comment: "유저 권한(CUSTOMER, ENGINEER, ADMIN)",
  },
  address: {
    field: "address",
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: "주소",
  },
  provider: {
    field: "provider",
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: "local",
    comment: "로그인 제공자(local, KAKAO, GOOGLE 등)",
  },
  social_id: {
    field: "social_id",
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true, // 소셜 ID는 고유해야 함
    comment: "소셜 로그인 ID",
  },
  profile_image_url: {
    field: "profile_image_url",
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: "유저 프로필 사진 URL",
  },
  createdAt: {
    field: "created_at",
    type: DataTypes.DATE,
    allowNull: false, // 데이터 생성 시각은 항상 존재
  },
  updatedAt: {
    field: "updated_at",
    type: DataTypes.DATE,
    allowNull: false, // 데이터 수정 시각은 항상 존재
  },
  deletedAt: {
    field: "deleted_at",
    type: DataTypes.DATE,
    allowNull: true,
  },
};

// 옵션 설정
const options = {
  charset: "utf8mb4",
  collate: "utf8mb4_unicode_ci", // unicode_ci가 일반적
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
