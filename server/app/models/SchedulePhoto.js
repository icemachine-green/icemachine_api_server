import dayjs from "dayjs";
import { DataTypes } from "sequelize";

const modelName = "SchedulePhoto";

const attributes = {
  id: {
    field: "id",
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "사진 고유 식별자",
  },
  schedule_id: {
    field: "schedule_id",
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "예약 ID",
  },
  photo_url: {
    field: "photo_url",
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: "사진 URL",
  },
  type: {
    field: "type",
    type: DataTypes.ENUM("BEFORE", "AFTER"),
    allowNull: false,
    comment: "사진 종류",
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
  tableName: "schedule_photos",
  timestamps: true,
  paranoid: true,
};

const SchedulePhoto = {
  init: (sequelize) => {
    const define = sequelize.define(modelName, attributes, options);
    return define;
  },

  associate: (db) => {
    // Schedule
    db.SchedulePhoto.belongsTo(db.Schedule, {
      foreignKey: "schedule_id",
      targetKey: "id",
    });
  },
};

export default SchedulePhoto;
