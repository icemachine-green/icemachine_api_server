/**
 * @file app/models/index.js
 * @description Sequelize 모델 초기화
 * 251216 v1.0.0 Lee init
 * 251222 v1.1.0 Lee update new schema models
 */
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import User from "./User.js";
import Admin from "./Admin.js";
import Business from "./Business.js"; // Business 모델 추가
import Engineer from "./Engineer.js";
import EngineerShift from "./EngineerShift.js";
import IceMachine from "./IceMachine.js";
import ServicePolicy from "./ServicePolicy.js";
import Reservation from "./Reservation.js";
import Review from "./Review.js";
import SchedulePhoto from "./SchedulePhoto.js";
import AdminNotification from "./AdminNotification.js";

dotenv.config();

const db = {};

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: console.log, // 로깅  process.env.APP_MODE === "development" &&
    // --- 타임존 설정 추가 시작 ---
    timezone: "+09:00", // Sequelize가 쿼리를 작성할 때 한국 시간대 적용
    dialectOptions: {
      charset: "utf8mb4",
      dateStrings: true, // DB에서 날짜를 읽어올 때 문자열로 강제 변환 (자동 변환 방지)
      typeCast: true, // DB에서 날짜를 가져올 때 설정한 timezone 적용
    },
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
  Admin,
  Business, // Business 모델 추가
  Engineer,
  EngineerShift,
  IceMachine,
  ServicePolicy,
  Reservation,
  Review,
  SchedulePhoto,
  AdminNotification,
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
