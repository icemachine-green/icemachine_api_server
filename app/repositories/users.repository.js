/**
 * @file app/repositories/users.repository.js
 * @description 유저 관련 레포지토리
 * 251216 v1.0.0 Lee init
 */
import { Op } from "sequelize";
import db from "../models/index.js";

const { User } = db;

const findUserByEmail = async (email) => {
  return await User.findOne({
    where: { email },
  });
};

const createUser = async (t = null, userData) => {
  return await User.create(userData, { transaction: t });
};

const findUserBySocialId = async (socialId) => {
  return await User.findOne({
    where: { socialId },
  });
};

const findUserById = async (id) => {
  return await User.findByPk(id);
};

const findUserByRefreshToken = async (token) => {
  return await User.findOne({
    where: { refreshToken: token },
  });
};

const save = async (user, t = null) => {
  return await user.save({ transaction: t });
};

export default {
  findUserByEmail,
  createUser,
  findUserBySocialId,
  findUserById,
  findUserByRefreshToken,
  save,
};
