/**
 * @file databases/migrations/20260106014727-create-admin-notifications.js
 * @description 'admin_notifications' 테이블 생성 마이그레이션 (isHidden 추가본)
 * 260106 v1.0.1 Gemini-init
 */
import { DataTypes } from "sequelize";

const tableName = "admin_notifications";

const attributes = {
  id: {
    field: "id",
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "알림 PK",
  },
  type: {
    field: "type",
    type: DataTypes.ENUM("RESERVATION_CANCEL", "NEW_INQUIRY", "SYSTEM_ALERT"),
    allowNull: false,
    comment: "알림 유형",
  },
  referenceId: {
    field: "reference_id",
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: "연관 테이블 PK",
  },
  message: {
    field: "message",
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: "알림 요약 메시지",
  },
  isRead: {
    field: "is_read",
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: "읽음 여부",
  },
  isTodo: {
    field: "is_todo",
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: "TODO 리스트 여부",
  },
  status: {
    field: "status",
    type: DataTypes.ENUM("PENDING", "DONE"),
    allowNull: false,
    defaultValue: "PENDING",
    comment: "처리 상태",
  },
  isHidden: {
    field: "is_hidden",
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: "목록 숨김 여부 (삭제 대신 사용)",
  },
  adminMemo: {
    field: "admin_memo",
    type: DataTypes.TEXT,
    allowNull: true,
    comment: "관리자 업무 메모",
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

    // 효율적인 조회를 위한 인덱스 추가
    await queryInterface.addIndex(tableName, ["is_read"]);
    await queryInterface.addIndex(tableName, [
      "is_todo",
      "status",
      "is_hidden",
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(tableName);
  },
};
