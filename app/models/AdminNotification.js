/**
 * @file app/models/AdminNotification.js
 * @description 'admin_notifications' 테이블 모델
 * 260106 v1.0.0 Gemini-init
 */
import dayjs from "dayjs";
import { DataTypes } from "sequelize";

const modelName = "AdminNotification";

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
    comment: "목록 숨김 여부",
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
  tableName: "admin_notifications",
  timestamps: true,
  paranoid: true,
};

const AdminNotification = {
  init: (sequelize) => {
    return sequelize.define(modelName, attributes, options);
  },

  associate: (db) => {
    // 예약 테이블과의 관계 설정
    db.AdminNotification.belongsTo(db.Reservation, {
      foreignKey: "reference_id",
      targetKey: "id",
      constraints: false, // 다양한 테이블을 참조할 수 있으므로 제약조건은 해제 가능
    });
  },
};

export default AdminNotification;
