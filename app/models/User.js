/**
 * @file app/models/User.js
 * @description 'users' 테이블 모델
 * 251222 v1.0.0 Lee-init
 */
import dayjs from "dayjs";
import { DataTypes } from "sequelize";

const modelName = "User";

const attributes = {
  id: {
    field: "id",
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "유저 PK",
  },
  socialId: {
    field: "social_id",
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: "소셜 로그인 ID",
  },
  email: {
    field: "email",
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: "카카오 이메일",
  },
  provider: {
    field: "provider",
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: "로그인 제공자 ('kakao')",
  },
  name: {
    field: "name",
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: "사용자 이름",
  },
  phoneNumber: {
    field: "phone_number",
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: "연락처",
  },
  refreshToken: {
    field: "refresh_token",
    type: DataTypes.STRING,
    allowNull: true,
    comment: "리프레시 토큰",
  },
  role: {
    field: "role",
    type: DataTypes.ENUM("customer", "engineer"),
    allowNull: false,
    defaultValue: "customer",
    comment: "유저 권한(customer, engineer, admin)",
  },
  createdAt: {
    field: "created_at",
    type: DataTypes.DATE,
    allowNull: false,
    get() {
      return dayjs(this.getDataValue("createdAt")).format(
        "YYYY-MM-DD HH:mm:ss"
      );
    },
  },
  updatedAt: {
    field: "updated_at",
    type: DataTypes.DATE,
    allowNull: false,
    get() {
      return dayjs(this.getDataValue("updatedAt")).format(
        "YYYY-MM-DD HH:mm:ss"
      );
    },
  },
  deletedAt: {
    field: "deleted_at",
    type: DataTypes.DATE,
    allowNull: true,
    get() {
      const val = this.getDataValue("deletedAt");
      if (!val) return null;
      return dayjs(val).format("YYYY-MM-DD HH:mm:ss");
    },
  },
};

const options = {
  tableName: "users",
  timestamps: true,
  paranoid: true,
};

const User = {
  init: (sequelize) => {
    return sequelize.define(modelName, attributes, options);
  },

  associate: (db) => {
    db.User.hasMany(db.Business, { foreignKey: "user_id", sourceKey: "id" });
  },
};

export default User;
