/**
 * @file app/models/index.js
 * @description Sequelize 모델 초기화
 * 251216 v1.0.0 Lee init
 */
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import User from "./User.js"; // User 모델 import
import Service from "./Service.js"; // Service 모델 import
import Schedule from "./Schedule.js"; // Schedule 모델 import
import SchedulePhoto from "./SchedulePhoto.js"; // SchedulePhoto 모델 import
import Review from "./Review.js"; // Review 모델 import
import EngineerBadge from "./EngineerBadge.js"; // EngineerBadge 모델 import

dotenv.config();

const db = {};

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false, // 로깅이 필요하면 console.log로 변경
    pool: {
      max: parseInt(process.env.DB_POOL_MAX),
      min: parseInt(process.env.DB_POOL_MIN),
      acquire: parseInt(process.env.DB_POOL_ACQUIRE),
      idle: parseInt(process.env.DB_POOL_IDLE),
    },
  }
);

// --- 모델 초기화 (자동) ---
// 추후 다른 모델 추가 시 배열에 계속 추가
// 아래 forEach로 자동 init 및 관계 설정
const modelsToInit = [
  User,
  Service,
  Schedule,
  SchedulePhoto,
  Review,
  EngineerBadge,
  // Service,
  // Schedule,
  // Review,
  // Payment,
  // EngineerBadge
];

// Sequelize 인스턴스 주입
db.sequelize = sequelize;

modelsToInit.forEach((model) => {
  const definedModel = model.init(sequelize);
  db[definedModel.name] = definedModel;
});

// --- 모델 관계 설정 (자동) ---
modelsToInit.forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

export default db;
