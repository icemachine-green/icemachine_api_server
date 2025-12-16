/**
 * @file app/models/User.js
 * @description user model
 */

import dayjs from "dayjs";
import { DataTypes } from "sequelize";

const modelName = "User"; // 모델명(JS 내부에서 사용)

// 컬럼 정의
const attributes = {
  id: {
    field: "id",
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
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
    unique: true, // 이름(닉네임)도 고유하게 관리
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
    allowNull: true,
    get() {
      const val = this.getDataValue("createdAt");
      if (!val) return null;
      return dayjs(val).format("YYYY-MM-DD HH:mm:ss");
    },
  },
  updatedAt: {
    field: "updated_at",
    type: DataTypes.DATE,
    allowNull: true,
    get() {
      const val = this.getDataValue("updatedAt");
      if (!val) return null;
      return dayjs(val).format("YYYY-MM-DD HH:mm:ss");
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
  tableName: "users", // 실제 테이블 명
  timestamps: true, // createdAt, updatedAt
  paranoid: true, // deletedAt 자동 관리
};

const User = {
  init: (sequelize) => {
    const define = sequelize.define(modelName, attributes, options);

    // JSON으로 serialize 시 제외할 컬럼 지정
    define.prototype.toJSON = function () {
      const attributes = this.get();
      delete attributes.password;
      return attributes;
    };

    return define;
  },

  associate: (db) => {
    // User as Customer has many Schedules
    db.User.hasMany(db.Schedule, {
      as: "CustomerSchedules",
      foreignKey: "customer_id",
      sourceKey: "id",
    });

    // User as Engineer has many Schedules
    db.User.hasMany(db.Schedule, {
      as: "EngineerSchedules",
      foreignKey: "engineer_id",
      sourceKey: "id",
    });

    // User as Customer has many Reviews
    db.User.hasMany(db.Review, {
      as: "CustomerReviews",
      foreignKey: "customer_id",
      sourceKey: "id",
    });

    // User as Engineer has many Reviews
    db.User.hasMany(db.Review, {
      as: "EngineerReviews",
      foreignKey: "engineer_id",
      sourceKey: "id",
    });

    // User as Engineer has many EngineerBadges
    db.User.hasMany(db.EngineerBadge, {
      foreignKey: "engineer_id",
      sourceKey: "id",
    });
  },
};

export default User;
