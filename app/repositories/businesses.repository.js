/**
 * @file app/repositories/businesses.repository.js
 * @description 업체 관련 레포지토리
 * 251229 v1.0.0 Lee init
 */
import db from '../models/index.js';

const { Business, IceMachine } = db;

const createBusiness = async (businessData, transaction) => {
  return await Business.create(businessData, { transaction });
};

const createIceMachine = async (iceMachineData, transaction) => {
  return await IceMachine.create(iceMachineData, { transaction });
};

const findBusinessesByUserId = async (userId) => {
  return await Business.findAll({
    where: { userId },
  });
};

const findBusinessById = async (businessId) => {
  return await Business.findByPk(businessId);
};

const updateBusiness = async (businessId, userId, updateData) => {
  const [updatedRows] = await Business.update(updateData, {
    where: { id: businessId, userId: userId },
  });
  return updatedRows > 0; // Return true if at least one row was updated
};

const deleteBusiness = async (businessId, userId) => {
  const deletedRows = await Business.destroy({
    where: { id: businessId, userId: userId },
  });
  return deletedRows > 0; // Return true if at least one row was deleted
};

export default {
  createBusiness,
  findBusinessesByUserId,
  findBusinessById,
  updateBusiness,
  deleteBusiness,
};
