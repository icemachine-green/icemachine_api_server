/**
 * @file app/repositories/engineers.repository.js
 * @description 엔지니어 관련 레포지토리
 * 251231 v1.0.0 You init
 */
import db from '../models/index.js';

const { Engineer, EngineerShift } = db;

const findActiveEngineersWithShifts = async () => {
  return await Engineer.findAll({
    where: { isActive: true },
    include: {
      model: EngineerShift,
      required: true, // 근무 스케줄이 있는 기사만 조회
    },
  });
};

const findEngineerByUserId = async (userId) => {
  return await Engineer.findOne({
    where: {
      userId,
      deletedAt: null,
    },
    attributes: ["id", "skillLevel", "isActive", "introduction"],
  });
};

const createEngineer = async (t = null, engineerData) => {
  return await Engineer.create(engineerData, { transaction: t });
};

// 신규 기사 가입 시 기본 근무시간 자동 생성
// 월~금 09:00~18:00
const createDefaultShifts = async (t, engineerId) => {
  const shifts = [];

  for (let day = 1; day <= 5; day++) {
    shifts.push({
      engineerId,
      availableDate: day,
      shiftStart: '09:00:00',
      shiftEnd: '18:00:00',
    });
  }

  return await EngineerShift.bulkCreate(shifts, { transaction: t });
};

export default {
  findActiveEngineersWithShifts,
  findEngineerByUserId,
  createEngineer,
  createDefaultShifts,
};
