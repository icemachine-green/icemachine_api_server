/**
 * @file app/models/Engineer.js
 * @description 'engineers' 테이블 모델
 * 251222 v1.0.0 Lee-init
 */
import dayjs from 'dayjs';
import { DataTypes } from 'sequelize';

const modelName = 'Engineer';

const attributes = {
  userId: {
    field: 'user_id',
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    comment: 'Users 테이블의 PK (외래키)',
  },
  skillLevel: {
    field: 'skill_level',
    type: DataTypes.ENUM('JUNIOR', 'SENIOR', 'MASTER'),
    allowNull: false,
    defaultValue: 'JUNIOR',
    comment: '기사 기술 등급',
  },
  introduction: {
    field: 'introduction',
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '고객에게 노출되는 기사 소개글',
  },
  isActive: {
    field: 'is_active',
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '현재 배정 가능한 상태인지 여부',
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
  tableName: 'engineers',
  timestamps: true,
  paranoid: true,
};

const Engineer = {
  init: (sequelize) => {
    return sequelize.define(modelName, attributes, options);
  },

  associate: (db) => {
    db.Engineer.belongsTo(db.User, {
      foreignKey: 'user_id',
      targetKey: 'id',
    });
  },
};

export default Engineer;
