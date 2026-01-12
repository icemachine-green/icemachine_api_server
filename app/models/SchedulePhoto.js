/**
 * @file app/models/SchedulePhoto.js
 * @description 'schedule_photos' 테이블 모델
 * 251222 v1.0.0 Lee-init
 */
import dayjs from 'dayjs';
import { DataTypes } from 'sequelize';

const modelName = 'SchedulePhoto';

const attributes = {
  id: {
    field: 'id',
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: '스케줄 사진 PK',
  },
  reservationId: {
    field: 'reservation_id',
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Reservations 테이블의 PK (외래키)',
  },
  imageUrl: {
    field: 'image_url',
    type: DataTypes.STRING,
    allowNull: false,
    comment: '사진 URL',
  },
  photoType: {
    field: 'photo_type',
    type: DataTypes.ENUM('BEFORE', 'AFTER', 'ISSUE'),
    allowNull: false,
    defaultValue: 'BEFORE',
    comment: '사진 유형 (\'BEFORE\', \'AFTER\', \'ISSUE\')',
  },
  description: {
    field: 'description',
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '사진 설명',
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
  tableName: 'schedule_photos',
  timestamps: true,
  paranoid: false, // deletedAt 컬럼이 스키마에 없으므로 paranoid는 false
};

const SchedulePhoto = {
  init: (sequelize) => {
    return sequelize.define(modelName, attributes, options);
  },

  associate: (db) => {
    db.SchedulePhoto.belongsTo(db.Reservation, {
      foreignKey: 'reservation_id',
      targetKey: 'id',
    });
  },
};

export default SchedulePhoto;