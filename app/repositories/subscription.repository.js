/**
 * @file app/repositories/subscription.repository.js
 * @description subscription repository
 * 260112 v1.0.0 jung init
 */
import db from '../models/index.js';
const { sequelize, Subscription } = db;

async function upsert(t = null, data) {
  return await Subscription.upsert(data, {transaction: t});
}

export default {
  upsert,
}