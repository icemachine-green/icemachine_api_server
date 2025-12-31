/**
 * @file app/models/Reservation.js
 * @description 'reservations' 테이블 모델
 * 251222 v1.0.0 Lee-init
 */
import dayjs from "dayjs";
import { DataTypes } from "sequelize";

const modelName = "Reservation";

const attributes = {
  id: {
    field: "id",
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "예약 PK",
  },
  userId: {
    field: "user_id",
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "Users 테이블의 PK (외래키)",
  },
  businessId: {
    field: "business_id",
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "Businesses 테이블의 PK (외래키)",
  },
  engineerId: {
    field: "engineer_id",
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: "Engineers 테이블의 user_id (외래키)",
  },
  iceMachineId: {
    field: "ice_machine_id",
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "IceMachines 테이블의 PK (외래키)",
  },
  servicePolicyId: {
    field: "service_policy_id",
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "ServicePolicies 테이블의 PK (외래키)",
  },
  reservedDate: {
    field: "reserved_date",
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: "예약 날짜",
    get() {
      return dayjs(this.getDataValue("reservedDate")).format("YYYY-MM-DD");
    },
  },
  serviceStartTime: {
    field: "service_start_time",
    type: DataTypes.DATE,
    allowNull: false,
    comment: "서비스 시작 시간",
    get() {
      return dayjs(this.getDataValue("serviceStartTime")).format(
        "YYYY-MM-DD HH:mm:ss"
      );
    },
  },
  serviceEndTime: {
    field: "service_end_time",
    type: DataTypes.DATE,
    allowNull: false,
    comment: "서비스 종료 시간",
    get() {
      return dayjs(this.getDataValue("serviceEndTime")).format(
        "YYYY-MM-DD HH:mm:ss"
      );
    },
  },
  status: {
    field: "status",
    type: DataTypes.ENUM(
      "PENDING",
      "CONFIRMED",
      "START",
      "COMPLETED",
      "CANCELED"
    ),
    allowNull: false,
    defaultValue: "PENDING",
    comment: "예약 상태",
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
  tableName: "reservations",
  timestamps: true,
  paranoid: true,
};

const Reservation = {
  init: (sequelize) => {
    return sequelize.define(modelName, attributes, options);
  },

  associate: (db) => {
    db.Reservation.belongsTo(db.User, {
      foreignKey: "user_id",
      targetKey: "id",
    });
    db.Reservation.belongsTo(db.Business, {
      foreignKey: "business_id",
      targetKey: "id",
    });
    db.Reservation.belongsTo(db.Engineer, {
      foreignKey: "engineer_id",
      targetKey: "user_id",
    });
    db.Reservation.belongsTo(db.IceMachine, {
      foreignKey: "ice_machine_id",
      targetKey: "id",
    });
    db.Reservation.belongsTo(db.ServicePolicy, {
      foreignKey: "service_policy_id",
      targetKey: "id",
    });

    db.Reservation.hasMany(db.Review, {
      foreignKey: 'reservation_id',
      sourceKey: 'id',
    });
  },
};

export default Reservation;
