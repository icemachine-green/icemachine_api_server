/**
 * @file app/controllers/businesses.controller.js
 * @description 업체 관련 컨트롤러
 * 251229 v1.0.0 Lee init
 */
import businessesService from '../services/businesses.service.js';
import { createBaseResponse } from '../utils/createBaseResponse.util.js';
import { SUCCESS } from '../../configs/responseCode.config.js';

async function registerBusiness(req, res, next) {
  try {
    // authMiddleware를 통해 req.user에 주입된 사용자 ID를 획득합니다.
    const { id: userId } = req.user;
    const { iceMachines: iceMachinesDto, ...businessDto } = req.body;

    const result = await businessesService.registerBusinessWithIceMachines(
      userId,
      businessDto,
      iceMachinesDto
    );

    return res
      .status(SUCCESS.status)
      .send(createBaseResponse(SUCCESS, result));
  } catch (error) {
    next(error);
  }
}

async function getBusinesses(req, res, next) {
  try {
    // authMiddleware를 통해 req.user에 주입된 사용자 ID를 획득합니다.
    const { id: userId } = req.user;

    const businesses = await businessesService.getBusinessesByUserId(userId);

    return res
      .status(SUCCESS.status)
      .send(createBaseResponse(SUCCESS, businesses));
  } catch (error) {
    next(error);
  }
}

async function getBusiness(req, res, next) {
  try {
    const { businessId } = req.params;
    // req.user 객체 전체를 서비스로 전달하여 역할 기반 접근 제어를 수행합니다.
    const user = req.user; 

    const business = await businessesService.getBusinessById(businessId, user);

    return res
      .status(SUCCESS.status)
      .send(createBaseResponse(SUCCESS, business));
  } catch (error) {
    next(error);
  }
}

async function updateBusiness(req, res, next) {
  try {
    const { businessId } = req.params;
    const user = req.user; // From authMiddleware
    const updateDto = req.body;

    const updatedBusiness = await businessesService.updateBusiness(businessId, user, updateDto);

    return res
      .status(SUCCESS.status)
      .send(createBaseResponse(SUCCESS, updatedBusiness));
  } catch (error) {
    next(error);
  }
}

async function deleteBusiness(req, res, next) {
  try {
    const { businessId } = req.params;
    const user = req.user; // From authMiddleware

    await businessesService.deleteBusiness(businessId, user);

    return res
      .status(SUCCESS.status)
      .send(createBaseResponse(SUCCESS, { message: '매장이 성공적으로 삭제되었습니다.' }));
  } catch (error) {
    next(error);
  }
}

export default {
  registerBusiness,
  getBusinesses,
  getBusiness,
  updateBusiness,
  deleteBusiness,
};
