/**
 * @file app/models/Business.js
 * @description 'businesses' 테이블 모델
 * 251224 v1.0.0 Taeho-init
 */
import dayjs from 'dayjs';
import { DataTypes } from 'sequelize';

const modelName = 'Business';

const attributes = {
  id: {
    field: 'id',
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: '업체 PK',
  },
  userId: {
    field: 'user_id',
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Users 테이블의 PK (소유주)',
  },
  name: {
    field: 'name',
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '업체명',
  },
  mainAddress: {
    field: 'main_address',
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '기본 주소',
  },
  detailedAddress: {
    field: 'detailed_address',
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '상세 주소',
  },
  managerName: {
    field: 'manager_name',
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '담당자 이름',
  },
  phoneNumber: {
    field: 'phone_number',
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '업체 연락처',
  },
  createdAt: {
    field: 'created_at',
    type: DataTypes.DATE,
    allowNull: false,
    get() {
      return dayjs(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
    },
  },
  updatedAt: {
    field: 'updated_at',
    type: DataTypes.DATE,
    allowNull: false,
    get() {
      return dayjs(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss');
    },
  },
  deletedAt: {
    field: 'deleted_at',
    type: DataTypes.DATE,
    allowNull: true,
    get() {
      const val = this.getDataValue('deletedAt');
      if (!val) return null;
      return dayjs(val).format('YYYY-MM-DD HH:mm:ss');
    },
  },
};

const options = {
  tableName: 'businesses',
  timestamps: true,
  paranoid: true,
};

const Business = {
  init: (sequelize) => {
    return sequelize.define(modelName, attributes, options);
  },

  associate: (db) => {
    db.Business.belongsTo(db.User, {
      foreignKey: 'user_id',
      targetKey: 'id',
    });
    db.Business.hasMany(db.IceMachine, {
      foreignKey: 'business_id',
      sourceKey: 'id',
    });
  },
};

export default Business;
