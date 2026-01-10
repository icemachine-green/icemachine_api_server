/**
 * @file app/repositories/icemachines.repository.js
 */
import db from "../models/index.js";

const { IceMachine } = db;

const createIceMachine = async (iceMachineData, transaction) => {
  return await IceMachine.create(iceMachineData, { transaction });
};

const findIceMachinesByBusinessId = async (businessId) => {
  return await IceMachine.findAll({
    where: { businessId },
  });
};

const findIceMachineById = async (iceMachineId) => {
  return await IceMachine.findByPk(iceMachineId);
};

const updateIceMachine = async (iceMachineId, updateData) => {
  const [updatedRows] = await IceMachine.update(updateData, {
    where: { id: iceMachineId },
  });
  return updatedRows > 0;
};

const deleteIceMachine = async (iceMachineId) => {
  const deletedRows = await IceMachine.destroy({
    where: { id: iceMachineId },
  });
  return deletedRows > 0;
};

export default {
  createIceMachine,
  findIceMachinesByBusinessId,
  findIceMachineById,
  updateIceMachine,
  deleteIceMachine,
};
