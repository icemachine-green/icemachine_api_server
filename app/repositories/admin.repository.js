/**
 * @file repositories/admin.repository.js
 * @description 관리자 관련 repository
 * 251230 v1.0.0 jung init
 */

import db from "../models/index.js";

const { User } = db;

async function findAllCustomers(t = null) {
  return await User.findAll(
    {
      where: { role: 'customer' },
      transaction: t
    }
  );
}

async function findAllEngineers(t = null) {
  return await User.findAll(
    {
      where: { role: 'engineer' },
      transaction: t
    }
  );
}

export default {
  findAllCustomers,
  findAllEngineers
}