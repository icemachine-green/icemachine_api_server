/**
 * @file app/models/AdminSubscription.js
 * @description 'admin_subscriptions' 테이블 모델 (관리자 전용 Web Push)
 */
import { DataTypes } from "sequelize";

const modelName = "AdminSubscription";

const attributes = {
  id: {
    field: "id",
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "Admin Push Subscription PK",
  },
  adminId: {
    field: "admin_id",
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "Admins 테이블 FK",
  },
  endpoint: {
    field: "endpoint",
    type: DataTypes.STRING(500),
    allowNull: false,
    unique: true,
    comment: "Push endpoint",
  },
  p256dh: {
    field: "p256dh",
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: "Push public key",
  },
  auth: {
    field: "auth",
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: "Push auth secret",
  },
  userAgent: {
    field: "user_agent",
    type: DataTypes.STRING,
    allowNull: true,
    comment: "관리자 브라우저 정보",
  },
  isActive: {
    field: "is_active",
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: "활성 여부",
  },
};

const options = {
  tableName: "admin_subscriptions", // 테이블 이름은 구분해주는 게 안전해요
  timestamps: true,
  paranoid: false,
};

const AdminSubscription = {
  init: (sequelize) => {
    return sequelize.define(modelName, attributes, options);
  },

  associate: (db) => {
    db.AdminSubscription.belongsTo(db.Admin, {
      foreignKey: "admin_id",
      targetKey: "id",
    });
  },
};

export default AdminSubscription;
