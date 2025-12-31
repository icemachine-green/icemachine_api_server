/**
 * @file app/models/IceMachine.js
 * @description 'ice_machines' 테이블 모델
 * 251222 v1.0.0 Lee-init
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
    allowNull: false,
    comment: "제빙기 PK",
  },
  businessId: {
    field: "business_id",
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "Businesses 테이블의 PK (외래키)",
  },
  modelType: {
    field: "model_type",
    type: DataTypes.STRING,
    allowNull: false,
    comment: "'옵션선택값' | '모름' | '기타'",
  },
  sizeType: {
    field: "size_type",
    type: DataTypes.STRING,
    allowNull: false,
    comment: "'소형' | '중형' | '대형' | '모름' | '기타'",
  },
  modelName: {
    field: "model_name",
    type: DataTypes.STRING,
    allowNull: false,
    comment: "기타 입력 or 실제 모델명 or 모름",
  },
  modelPic: {
    field: "model_pic",
    type: DataTypes.STRING,
    allowNull: true,
    comment: "모델 사진 URL",
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
  tableName: "ice_machines",
  timestamps: true,
  paranoid: true, // 소프트 삭제를 위해 paranoid true 설정
};

const IceMachine = {
  init: (sequelize) => {
    return sequelize.define(modelName, attributes, options);
  },

  associate: (db) => {
    db.IceMachine.belongsTo(db.Business, {
      foreignKey: "business_id",
      targetKey: "id",
    });
  },
};

export default IceMachine;
