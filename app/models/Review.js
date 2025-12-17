/**
 * @file app/models/Review.js
 * @description 리뷰 모델
 * 251216 v1.0.0 Lee init
 */
import dayjs from "dayjs";
import { DataTypes } from "sequelize";

const modelName = "Review";

const attributes = {
  id: {
    field: "id",
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "리뷰 고유 식별자",
  },
  schedule_id: {
    field: "schedule_id",
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // Assuming one review per schedule
    comment: "예약 ID",
  },
  customer_id: {
    field: "customer_id",
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "리뷰 작성 고객 ID",
  },
  engineer_id: {
    field: "engineer_id",
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "리뷰 대상 엔지니어 ID",
  },
  rating: {
    field: "rating",
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "평점 (1~5)",
  },
  comment: {
    field: "comment",
    type: DataTypes.TEXT,
    allowNull: true,
    comment: "리뷰 내용",
  },
  createdAt: {
    field: "created_at",
    type: DataTypes.DATE,
    allowNull: true,
    get() {
      const val = this.getDataValue("createdAt");
      if (!val) return null;
      return dayjs(val).format("YYYY-MM-DD HH:mm:ss");
    },
  },
  updatedAt: {
    field: "updated_at",
    type: DataTypes.DATE,
    allowNull: true,
    get() {
      const val = this.getDataValue("updatedAt");
      if (!val) return null;
      return dayjs(val).format("YYYY-MM-DD HH:mm:ss");
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
  tableName: "reviews",
  timestamps: true,
  paranoid: true,
};

const Review = {
  init: (sequelize) => {
    const define = sequelize.define(modelName, attributes, options);
    return define;
  },

  associate: (db) => {
    // Schedule
    db.Review.belongsTo(db.Schedule, {
      foreignKey: "schedule_id",
      targetKey: "id",
    });

    // Customer (User)
    db.Review.belongsTo(db.User, {
      as: "Customer",
      foreignKey: "customer_id",
      targetKey: "id",
    });

    // Engineer (User)
    db.Review.belongsTo(db.User, {
      as: "Engineer",
      foreignKey: "engineer_id",
      targetKey: "id",
    });
  },
};

export default Review;
