/**
 * @file app/controllers/servicePolicies.controller.js
 * @description 서비스 정책 관련 컨트롤러
 */
import servicePoliciesService from "../services/servicePolicies.service.js";
import { createBaseResponse } from "../utils/createBaseResponse.util.js";
import { SUCCESS } from "../../configs/responseCode.config.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

/**
 * 모든 서비스 정책 조회 API
 */
const getAllPolicies = asyncHandler(async (req, res) => {
  const result = await servicePoliciesService.getActivePolicies();

  return res.status(SUCCESS.status).send(createBaseResponse(SUCCESS, result));
});

export default {
  getAllPolicies,
};
