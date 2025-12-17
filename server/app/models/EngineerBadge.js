/**
 * @file app/models/EngineerBadge.js
 * @description 엔지니어 뱃지 모델
 * 251216 v1.0.0 Lee init
 */
import dayjs from "dayjs";
import { DataTypes } from "sequelize";

const modelName = "EngineerBadge";

const attributes = {
  id: {
    field: "id",
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "칭호 획득 ID",
  },
  engineer_id: {
    field: "engineer_id",
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "엔지니어 ID",
  },
  badge_type: {
    field: "badge_type",
    type: DataTypes.ENUM("ALL_ROUNDER", "KINDNESS", "METICULOUS", "NEATNESS", "SPEED"),
    allowNull: false,
    comment: "칭호 종류",
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
  tableName: "engineer_badges",
  timestamps: true,
  paranoid: true,
};

const EngineerBadge = {
  init: (sequelize) => {
    const define = sequelize.define(modelName, attributes, options);
    return define;
  },

  associate: (db) => {
    // Engineer (User)
    db.EngineerBadge.belongsTo(db.User, {
      foreignKey: "engineer_id",
      targetKey: "id",
    });
  },
};

export default EngineerBadge;
