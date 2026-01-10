/**
 * @file controllers/icemachines.controller.js
 * @description 제빙기 관련 요청을 처리하는 컨트롤러 (asyncHandler 적용)
 * 260110 v1.0.1 Taeho Lee update
 */
import icemachinesService from "../services/icemachines.service.js";
import { createBaseResponse } from "../utils/createBaseResponse.util.js";
import {
  SUCCESS,
  BAD_REQUEST_ERROR,
} from "../../configs/responseCode.config.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import myError from "../errors/customs/my.error.js";

const getIceMachines = asyncHandler(async (req, res) => {
  const { businessId } = req.query;
  const user = req.user;

  if (!businessId) {
    throw myError("businessId 쿼리 파라미터가 필요합니다.", BAD_REQUEST_ERROR);
  }

  const iceMachines = await icemachinesService.getIceMachinesByBusinessId(
    parseInt(businessId),
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
