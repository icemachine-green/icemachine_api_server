/**
 * @file app/services/businesses.service.js
 * @description 업체 관련 서비스
 * 251229 v1.0.0 Lee init
 */
import businessesRepository from "../repositories/businesses.repository.js";
import icemachinesService from "../services/icemachines.service.js"; // icemachinesService import
import db from "../models/index.js"; // for transaction
import myError from "../errors/customs/my.error.js"; // myError import
import {
  NOT_FOUND_ERROR,
  FORBIDDEN_ERROR,
  UNMATCHING_USER_ERROR,
} from "../../configs/responseCode.config.js";

const registerBusinessWithIceMachines = async (
  userId,
  businessDto,
  iceMachinesDto
) => {
  const t = await db.sequelize.transaction(); // 트랜잭션 시작
  try {
    // 1. 매장(Business) 정보 생성
    const businessData = {
      userId,
      name: businessDto.name,
      mainAddress: businessDto.mainAddress,
      detailedAddress: businessDto.detailedAddress,
      managerName: businessDto.managerName,
      phoneNumber: businessDto.phoneNumber,
    };
    const newBusiness = await businessesRepository.createBusiness(
      businessData,
      t
    );

    // 2. 제빙기(IceMachine) 정보 생성
    const iceMachines = [];
    // 🚩 프론트에서 넘어온 데이터를 백엔드 모델 규격(brandName 등)으로 확실히 매핑해서 전달
    for (const dto of iceMachinesDto) {
      const mappedMachineData = {
        brandName: dto.brandName || dto.brand,
        modelName: dto.modelName || dto.model,
        sizeType: dto.sizeType || dto.size,
      };

      const newIceMachine = await icemachinesService.addIceMachineToBusiness(
        newBusiness.id,
        mappedMachineData, // 보정된 데이터를 두 번째 인자로 전달
        t
      );
      iceMachines.push(newIceMachine);
    }

    await t.commit(); // 모든 작업 성공 시 트랜잭션 커밋
    return { newBusiness, iceMachines };
  } catch (error) {
    await t.rollback(); // 에러 발생 시 트랜잭션 롤백
    throw error;
  }
};

const getBusinessesByUserId = async (userId) => {
  return await businessesRepository.findBusinessesByUserId(userId);
};

const getBusinessById = async (businessId, userFromReq) => {
  const business = await businessesRepository.findBusinessById(businessId);
  if (!business) {
    throw myError("해당 매장을 찾을 수 없습니다.", NOT_FOUND_ERROR);
  }
  if (userFromReq.role === "admin" || userFromReq.role === "engineer") {
    return business;
  }
  if (business.userId !== userFromReq.id) {
    throw myError("해당 매장에 대한 접근 권한이 없습니다.", FORBIDDEN_ERROR);
  }
  return business;
};

const updateBusiness = async (businessId, userFromReq, updateDto) => {
  const business = await businessesRepository.findBusinessById(businessId);
  if (!business) {
    throw myError("해당 매장을 찾을 수 없습니다.", NOT_FOUND_ERROR);
  }
  if (business.userId !== userFromReq.id) {
    throw myError(
      "해당 매장에 대한 수정 권한이 없습니다.",
      UNMATCHING_USER_ERROR
    );
  }
  const isUpdated = await businessesRepository.updateBusiness(
    businessId,
    userFromReq.id,
    updateDto
  );
  if (!isUpdated) {
    throw myError(
      "매장 정보 업데이트에 실패했습니다. 변경사항이 없거나 일치하는 매장이 없습니다.",
      NOT_FOUND_ERROR
    );
  }
  return await businessesRepository.findBusinessById(businessId);
};

const deleteBusiness = async (businessId, userFromReq) => {
  const business = await businessesRepository.findBusinessById(businessId);
  if (!business) {
    throw myError("해당 매장을 찾을 수 없습니다.", NOT_FOUND_ERROR);
  }
  if (business.userId !== userFromReq.id) {
    throw myError(
      "해당 매장에 대한 삭제 권한이 없습니다.",
      UNMATCHING_USER_ERROR
    );
  }
  const isDeleted = await businessesRepository.deleteBusiness(
    businessId,
    userFromReq.id
  );
  if (!isDeleted) {
    throw myError("매장 삭제에 실패했습니다.", NOT_FOUND_ERROR);
  }
  return true;
};

export default {
  registerBusinessWithIceMachines,
  getBusinessesByUserId,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
};
