/**
 * @file app/controllers/servicePolicies.controller.js
 * @description 서비스 정책 관련 컨트롤러
 * 260109 v1.0.0
 */

import servicePoliciesService from "../services/servicePolicies.service.js";
import { createBaseResponse } from "../utils/createBaseResponse.util.js";
import { SUCCESS } from "../../configs/responseCode.config.js";

/**
 * 모든 서비스 정책 조회 API
 */
async function getAllPolicies(req, res, next) {
  try {
    const result = await servicePoliciesService.getActivePolicies();

    return res.status(SUCCESS.status).send(createBaseResponse(SUCCESS, result));
  } catch (error) {
    next(error);
  }
}

export default {
  getAllPolicies,
};
