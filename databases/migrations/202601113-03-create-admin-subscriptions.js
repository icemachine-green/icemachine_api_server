/**
 * @file databases/migrations/20260113000000-create-admin-subscription.js
 * @description 'admin_subscriptions' 테이블 생성 (관리자 전용 Web Push)
 */
import { DataTypes } from "sequelize";

const tableName = "admin_subscriptions";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: "Admin Push Subscription PK",
      },
      admin_id: {
        // 모델의 adminId (field: "admin_id")와 매칭
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "admins", // admins 테이블 참조
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        comment: "Admins 테이블 FK",
      },
      endpoint: {
        type: DataTypes.STRING(500),
        allowNull: false,
        unique: true,
        comment: "Push endpoint",
      },
      p256dh: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "Push public key",
      },
      auth: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "Push auth secret",
      },
      user_agent: {
        // 모델의 userAgent (field: "user_agent")와 매칭
        type: DataTypes.STRING,
        allowNull: true,
        comment: "관리자 브라우저 정보",
      },
      is_active: {
        // 모델의 isActive (field: "is_active")와 매칭
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "활성 여부",
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    // 검색 성능을 위한 인덱스 추가 (선택사항)
    await queryInterface.addIndex(tableName, ["admin_id"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(tableName);
  },
};
