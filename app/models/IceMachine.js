/**
 * @file app/models/IceMachine.js
 * @description 'ice_machines' 테이블 모델 (model_type 제거 및 구조 최적화)
 */
import dayjs from "dayjs";
import { DataTypes } from "sequelize";

const modelName = "IceMachine";

const attributes = {
  id: {
    field: "id",
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  businessId: {
    field: "business_id",
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // 🚩 브랜드와 모델명만 남깁니다.
  brandName: {
    field: "brand_name",
    type: DataTypes.STRING,
    allowNull: false,
  },
  modelName: {
    field: "model_name",
    type: DataTypes.STRING,
    allowNull: false,
  },
  sizeType: {
    field: "size_type",
    type: DataTypes.ENUM("소형", "중형", "대형"),
    allowNull: false,
  },
  // 🚩 화면 출력용 가상 필드
  fullModelName: {
    type: DataTypes.VIRTUAL,
    get() {
      return `${this.brandName} ${this.modelName}`;
    },
  },
  modelPic: {
    field: "model_pic",
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
  deletedAt: {
    field: "deleted_at",
    type: DataTypes.DATE,
    allowNull: true,
    get() {
      const val = this.getDataValue("deletedAt");
      return val ? dayjs(val).format("YYYY-MM-DD HH:mm:ss") : null;
    },
  },
};

const options = {
  tableName: "ice_machines",
  timestamps: true,
  paranoid: true,
};

const IceMachine = {
  init: (sequelize) => sequelize.define(modelName, attributes, options),
  associate: (db) => {
    db.IceMachine.belongsTo(db.Business, { foreignKey: "business_id" });
  },
};

export default IceMachine;
