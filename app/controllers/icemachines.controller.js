/**
 * @file app/controllers/icemachines.controller.js
 */
import icemachinesService from "../services/icemachines.service.js";
import { createBaseResponse } from "../utils/createBaseResponse.util.js";
import { SUCCESS } from "../../configs/responseCode.config.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

const getIceMachines = asyncHandler(async (req, res) => {
  const { businessId } = req.query;
  const user = req.user;

  const iceMachines = await icemachinesService.getIceMachinesByBusinessId(
    businessId, // parseInt는 서비스에서 처리하거나 여기서 하되 가독성을 유지
    user
  );

  return res
    .status(SUCCESS.status)
    .send(createBaseResponse(SUCCESS, iceMachines));
});

const addIceMachine = asyncHandler(async (req, res) => {
  const iceMachineDto = req.body;
  const user = req.user;

  const newIceMachine = await icemachinesService.addStandaloneIceMachine(
    iceMachineDto,
    user
  );

  return res
    .status(SUCCESS.status)
    .send(createBaseResponse(SUCCESS, newIceMachine));
});

const updateIceMachine = asyncHandler(async (req, res) => {
  const { iceMachineId } = req.params;
  const updateDto = req.body;
  const user = req.user;

  const updatedIceMachine = await icemachinesService.updateIceMachine(
    parseInt(iceMachineId),
    updateDto,
    user
  );

  return res
    .status(SUCCESS.status)
    .send(createBaseResponse(SUCCESS, updatedIceMachine));
});

const deleteIceMachine = asyncHandler(async (req, res) => {
  const { iceMachineId } = req.params;
  const user = req.user;

  const result = await icemachinesService.deleteIceMachine(
    parseInt(iceMachineId),
    user
  );

  return res.status(SUCCESS.status).send(createBaseResponse(SUCCESS, result));
});

export default {
  getIceMachines,
  addIceMachine,
  updateIceMachine,
  deleteIceMachine,
};
