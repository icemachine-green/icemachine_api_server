/**
 * @file app/repositories/businesses.repository.js
 */
import db from "../models/index.js";

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
  return updatedRows > 0;
};

const deleteBusiness = async (businessId, userId) => {
  const deletedRows = await Business.destroy({
    where: { id: businessId, userId: userId },
  });
  return deletedRows > 0;
};

export default {
  createBusiness,
  createIceMachine,
  findBusinessesByUserId,
  findBusinessById,
  updateBusiness,
  deleteBusiness,
};
