/**
 * @file app/models/Review.js
 * @description 'reviews' 테이블 모델
 * 251222 v1.0.0 Lee-init
 */
import dayjs from 'dayjs';
import { DataTypes } from 'sequelize';

const modelName = 'Review';

const attributes = {
  id: {
    field: 'id',
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: '리뷰 PK',
  },
  userId: {
    field: 'user_id',
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Users 테이블의 PK (외래키)',
  },
  rating: {
    field: 'rating',
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '별점 (1~5)',
  },
  quickOption: {
    field: 'quick_option',
    type: DataTypes.STRING,
    allowNull: true,
    comment: '빠른 선택지 (예: 친절해요)',
  },
  content: {
    field: 'content',
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '리뷰 내용',
  },
  imageUrl: {
    field: 'image_url',
    type: DataTypes.STRING,
    allowNull: true,
    comment: '리뷰 사진 URL',
    get() {
      const filename = this.getDataValue('imageUrl');
      if(!filename) {
        return null;
      }
      return `${process.env.APP_URL}${process.env.FILE_STATIC_PATH_REVIEW}/${filename}`;
    }
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
  tableName: 'reviews',
  timestamps: true,
  paranoid: true,
};

const Review = {
  init: (sequelize) => {
    return sequelize.define(modelName, attributes, options);
  },

  associate: (db) => {
    db.Review.belongsTo(db.User, {
      foreignKey: 'user_id',
      targetKey: 'id',
    });
  },
};

export default Review;