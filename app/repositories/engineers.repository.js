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

export default {
  findActiveEngineersWithShifts,
  findEngineerByUserId,
};
