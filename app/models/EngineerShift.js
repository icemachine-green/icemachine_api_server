/**
 * @file app/models/EngineerShift.js
 * @description 'engineer_shifts' 테이블 모델
 * 251222 v1.0.0 Lee-init
 */
import dayjs from 'dayjs';
import { DataTypes } from 'sequelize';

const modelName = 'EngineerShift';

const attributes = {
  id: {
    field: 'id',
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: '근무 시간 PK',
  },
  engineerId: {
    field: 'engineer_id',
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Engineer 테이블의 user_id (외래키)',
  },
  availableDate: {
    field: 'available_date',
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '요일 (0=일요일, 6=토요일)',
  },
  shiftStart: {
    field: 'shift_start',
    type: DataTypes.TIME,
    allowNull: false,
    comment: '근무 시작 시간',
  },
  shiftEnd: {
    field: 'shift_end',
    type: DataTypes.TIME,
    allowNull: false,
    comment: '근무 종료 시간',
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
  tableName: 'engineer_shifts',
  timestamps: true,
  paranoid: true,
};

const EngineerShift = {
  init: (sequelize) => {
    return sequelize.define(modelName, attributes, options);
  },

  associate: (db) => {
    db.EngineerShift.belongsTo(db.Engineer, {
      foreignKey: 'engineer_id',
      targetKey: 'user_id',
    });
  },
};

export default EngineerShift;
