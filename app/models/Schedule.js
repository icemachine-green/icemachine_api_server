/**
 * @file app/models/Schedule.js
 * @description 스케줄 모델
 * 251216 v1.0.0 Lee init
 */
import dayjs from "dayjs";
import { DataTypes } from "sequelize";

const modelName = "Schedule";

const attributes = {
  id: {
    field: "id",
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "예약 고유 식별자",
  },
  customer_id: {
    field: "customer_id",
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "예약 요청 고객 ID",
  },
  engineer_id: {
    field: "engineer_id",
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: "배정된 엔지니어 ID",
  },
  service_id: {
    field: "service_id",
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "요청한 서비스 ID",
  },
  visit_datetime: {
    field: "visit_datetime",
    type: DataTypes.DATE,
    allowNull: false,
    get() {
      const val = this.getDataValue("visit_datetime");
      if (!val) return null;
      return dayjs(val).format("YYYY-MM-DD HH:mm:ss");
    },
    comment: "방문 예정 일시",
  },
  address: {
    field: "address",
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: "서비스 받을 주소",
  },
  ice_machine_model: {
    field: "ice_machine_model",
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: "제빙기 모델명",
  },
  ice_machine_size: {
    field: "ice_machine_size",
    type: DataTypes.ENUM("SMALL", "MEDIUM", "LARGE"),
    allowNull: true,
    comment: "제빙기 사이즈",
  },
  special_request: {
    field: "special_request",
    type: DataTypes.TEXT,
    allowNull: true,
    comment: "고객 요청 사항",
  },
  status: {
    field: "status",
    type: DataTypes.ENUM("REQUESTED", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELED"),
    allowNull: false,
    comment: "예약 상태",
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
  tableName: "schedules",
  timestamps: true,
  paranoid: true,
};

const Schedule = {
  init: (sequelize) => {
    const define = sequelize.define(modelName, attributes, options);
    return define;
  },

  associate: (db) => {
    // Customer (User)
    db.Schedule.belongsTo(db.User, {
      as: "Customer",
      foreignKey: "customer_id",
      targetKey: "id",
    });

    // Engineer (User)
    db.Schedule.belongsTo(db.User, {
      as: "Engineer",
      foreignKey: "engineer_id",
      targetKey: "id",
    });

    // Service
    db.Schedule.belongsTo(db.Service, {
      foreignKey: "service_id",
      targetKey: "id",
    });

    // Has many SchedulePhotos
    db.Schedule.hasMany(db.SchedulePhoto, {
      foreignKey: "schedule_id",
      sourceKey: "id",
    });

    // Has one Review
    db.Schedule.hasOne(db.Review, {
      foreignKey: "schedule_id",
      sourceKey: "id",
    });
  },
};

export default Schedule;
