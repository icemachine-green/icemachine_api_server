/**
 * @file app/models/ServicePolicy.js
 * @description 'service_policies' 테이블 모델
 * 251222 v1.0.0 Lee-init
 */
import dayjs from 'dayjs';
import { DataTypes } from 'sequelize';

const modelName = 'ServicePolicy';

const attributes = {
  id: {
    field: 'id',
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: '서비스 정책 PK',
  },
  sizeType: {
    field: 'size_type',
    type: DataTypes.STRING,
    allowNull: false,
    comment: "'소형' | '중형' | '대형'",
  },
  serviceType: {
    field: 'service_type',
    type: DataTypes.ENUM('VISIT_CHECK', 'STANDARD_CLEAN', 'DEEP_CLEAN', 'PREMIUM_CLEAN', 'SUBSCRIPTION'),
    allowNull: false,
    comment: '서비스 종류',
  },
  standardDuration: {
    field: 'standard_duration',
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '작업 시간 (분 단위)',
  },
  description: {
    field: 'description',
    type: DataTypes.STRING,
    allowNull: true,
    comment: '내부 설명용',
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
};

const options = {
  tableName: 'service_policies',
  timestamps: true,
  paranoid: false, // deletedAt 컬럼이 스키마에 없으므로 paranoid는 false
};

const ServicePolicy = {
  init: (sequelize) => {
    return sequelize.define(modelName, attributes, options);
  },

  associate: (db) => {
    // Associations for ServicePolicy model if any
  },
};

export default ServicePolicy;
