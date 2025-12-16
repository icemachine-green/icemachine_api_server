import dayjs from "dayjs";
import { DataTypes } from "sequelize";

const modelName = "Service";

const attributes = {
  id: {
    field: "id",
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "서비스 고유 식별자",
  },
  name: {
    field: "name",
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: "서비스 이름 (예: 딥클린)",
  },
  description: {
    field: "description",
    type: DataTypes.TEXT,
    allowNull: true,
    comment: "서비스 상세 설명",
  },
  duration_hours: {
    field: "duration_hours",
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "예상 소요 시간",
  },
  base_price: {
    field: "base_price",
    type: DataTypes.DECIMAL,
    allowNull: false,
    comment: "기본 가격",
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
  tableName: "services",
  timestamps: true,
  paranoid: true,
};

const Service = {
  init: (sequelize) => {
    return sequelize.define(modelName, attributes, options);
  },

  associate: (db) => {
    // Associations will be added later
  },
};

export default Service;
