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
  cancelReason: {
    field: "cancel_reason",
    type: DataTypes.TEXT, // STRING 또는 TEXT (사유 길이에 따라 선택)
    allowNull: true, // TODO: 기사페이지에서만 구현이 된 상태라 기사 프론트에서 취소사유 없을시 클릭 막음. 추후 보완 필요
    comment: "예약 취소 사유",
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

// ... 기존 코드 상단 동일
const options = {
  tableName: "reservations",
  timestamps: true,
  paranoid: true,
  hooks: {
    // status가 'CANCELED'로 업데이트될 때 알림 생성
    afterUpdate: async (reservation, options) => {
      if (reservation.changed("status") && reservation.status === "CANCELED") {
        const { AdminNotification } = reservation.sequelize.models;
        await AdminNotification.create({
          type: "RESERVATION_CANCEL",
          referenceId: reservation.id,
          message: `예약 번호 ${reservation.id}번이 취소되었습니다.`,
          isTodo: true, // 취소건은 중요하므로 자동으로 TODO 등록
        });
      }
    },
  },
};
// ...
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
      targetKey: "id", // Engineer 테이블의 PK 기준
    });
    db.Reservation.belongsTo(db.IceMachine, {
      foreignKey: "ice_machine_id",
      targetKey: "id",
    });
    db.Reservation.belongsTo(db.ServicePolicy, {
      foreignKey: "service_policy_id",
      targetKey: "id",
    });
    // db.Reservation.hasMany(db.AdminNotification, {
    //   foreignKey: 'referenceId',
    //   sourceKey: 'id',
    // });
    db.Reservation.hasMany(db.AdminNotification, {
      foreignKey: "referenceId",
      sourceKey: "id",
    });
  },
};

export default Reservation;
