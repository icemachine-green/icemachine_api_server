/**
 * @file app/models/Subscription.js
 * @description 'subscriptions' 테이블 모델 (Web Push)
 */
import dayjs from 'dayjs';
import { DataTypes } from 'sequelize';

const modelName = 'Subscription';

const attributes = {
  id: {
    field: 'id',
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: 'Push Subscription PK',
  },
  userId: {
    field: 'user_id',
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Users 테이블 FK',
  },
  endpoint: {
    field: 'endpoint',
    type: DataTypes.STRING(500),
    allowNull: false,
    unique: true,
    comment: 'Push endpoint',
  },
  p256dh: {
    field: 'p256dh',
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Push public key',
  },
  auth: {
    field: 'auth',
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Push auth secret',
  },
  userAgent: {
    field: 'user_agent',
    type: DataTypes.STRING,
    allowNull: true,
    comment: '브라우저 / 디바이스 정보',
  },
  isActive: {
    field: 'is_active',
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '활성 여부',
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
  tableName: 'subscriptions',
  timestamps: true,
  paranoid: false, // deletedAt 컬럼이 스키마에 없으므로 paranoid는 false
};

const Subscription = {
  init: (sequelize) => {
    return sequelize.define(modelName, attributes, options);
  },

  associate: (db) => {
    db.Subscription.belongsTo(db.User, {
      foreignKey: 'user_id',
      targetKey: 'id',
    });
  },
};

export default Subscription;
