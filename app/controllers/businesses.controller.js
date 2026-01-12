/**
 * @file app/controllers/businesses.controller.js
 */
import businessesService from "../services/businesses.service.js";
import { createBaseResponse } from "../utils/createBaseResponse.util.js";
import { SUCCESS } from "../../configs/responseCode.config.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

// 매장 + 제빙기 동시 등록
const registerBusiness = asyncHandler(async (req, res) => {
  const { id: userId } = req.user;
  const { iceMachines: iceMachinesDto, ...businessDto } = req.body;

  const result = await businessesService.registerBusinessWithIceMachines(
    userId,
    businessDto,
    iceMachinesDto
  );

  return res.status(SUCCESS.status).send(createBaseResponse(SUCCESS, result));
});

// 내가 소유한 매장 목록 조회
const getBusinesses = asyncHandler(async (req, res) => {
  const { id: userId } = req.user;
  const businesses = await businessesService.getBusinessesByUserId(userId);

  return res
    .status(SUCCESS.status)
    .send(createBaseResponse(SUCCESS, businesses));
});

// 특정 매장 상세 조회
const getBusiness = asyncHandler(async (req, res) => {
  const { businessId } = req.params;
  const user = req.user;

  const business = await businessesService.getBusinessById(businessId, user);

  return res.status(SUCCESS.status).send(createBaseResponse(SUCCESS, business));
});

// 매장 정보 수정
const updateBusiness = asyncHandler(async (req, res) => {
  const { businessId } = req.params;
  const user = req.user;
  const updateDto = req.body;

  const updatedBusiness = await businessesService.updateBusiness(
    businessId,
    user,
    updateDto
  );

  return res
    .status(SUCCESS.status)
    .send(createBaseResponse(SUCCESS, updatedBusiness));
});

// 매장 삭제 (소프트 삭제)
const deleteBusiness = asyncHandler(async (req, res) => {
  const { businessId } = req.params;
  const user = req.user;

  await businessesService.deleteBusiness(businessId, user);

  return res.status(SUCCESS.status).send(
    createBaseResponse(SUCCESS, {
      message: "매장이 성공적으로 삭제되었습니다.",
    })
  );
});

export default {
  registerBusiness,
  getBusinesses,
  getBusiness,
  updateBusiness,
  deleteBusiness,
};
