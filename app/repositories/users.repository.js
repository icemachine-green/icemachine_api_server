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

const createUser = async (userData) => {
  return await User.create(userData);
};

const findUserBySocialId = async (socialId) => {
  return await User.findOne({
    where: { socialId },
  });
};

export default { findUserByEmail, createUser, findUserBySocialId };
