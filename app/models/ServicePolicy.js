/**
 * @file app/models/ServicePolicy.js
 */
import dayjs from "dayjs";
import { DataTypes } from "sequelize";

const modelName = "ServicePolicy";

const attributes = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  sizeType: {
    field: "size_type",
    type: DataTypes.ENUM("소형", "중형", "대형"),
    allowNull: false,
  },
  serviceType: {
    field: "service_type",
    type: DataTypes.ENUM("방문점검", "기본청소", "집중청소", "프리미엄"),
    allowNull: false,
  },
  standardDuration: {
    field: "standard_duration",
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    field: "price",
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  note: {
    field: "note",
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    field: "description",
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    field: "created_at",
    type: DataTypes.DATE,
    get() {
      return dayjs(this.getDataValue("createdAt")).format(
        "YYYY-MM-DD HH:mm:ss"
      );
    },
  },
  updatedAt: {
    field: "updated_at",
    type: DataTypes.DATE,
    get() {
      return dayjs(this.getDataValue("updatedAt")).format(
        "YYYY-MM-DD HH:mm:ss"
      );
    },
  },
};

const options = {
  tableName: "service_policies",
  timestamps: true,
};

const ServicePolicy = {
  init: (sequelize) => sequelize.define(modelName, attributes, options),
  associate: (db) => {},
};

export default ServicePolicy;
