/**
 * @file app/services/businesses.service.js
 */
import businessesRepository from "../repositories/businesses.repository.js";
import icemachinesService from "../services/icemachines.service.js";
import db from "../models/index.js";
import myError from "../errors/customs/my.error.js";
import {
  NOT_FOUND_ERROR,
  FORBIDDEN_ERROR,
  UNMATCHING_USER_ERROR,
  DB_ERROR,
} from "../../configs/responseCode.config.js";

const registerBusinessWithIceMachines = async (
  userId,
  businessDto,
  iceMachinesDto
) => {
  const t = await db.sequelize.transaction();
  try {
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

    const iceMachines = [];
    for (const dto of iceMachinesDto) {
      const mappedMachineData = {
        brandName: dto.brandName || dto.brand,
        modelName: dto.modelName || dto.model,
        sizeType: dto.sizeType || dto.size,
      };

      const newIceMachine = await icemachinesService.addIceMachineToBusiness(
        newBusiness.id,
        mappedMachineData,
        t
      );
      iceMachines.push(newIceMachine);
    }

    await t.commit();
    return { newBusiness, iceMachines };
  } catch (error) {
    await t.rollback();
    // 기존 로직 유지: Repository나 Service에서 올라온 에러를 그대로 전파하거나 DB_ERROR로 변환
    if (error.status) throw error;
    throw myError("매장 및 제빙기 등록 중 오류가 발생했습니다.", DB_ERROR);
  }
};

const getBusinessesByUserId = async (userId) => {
  try {
    return await businessesRepository.findBusinessesByUserId(userId);
  } catch (error) {
    throw myError("매장 목록 조회 중 오류가 발생했습니다.", DB_ERROR);
  }
};

const getBusinessById = async (businessId, userFromReq) => {
  let business;
  try {
    business = await businessesRepository.findBusinessById(businessId);
  } catch (error) {
    throw myError("매장 정보 조회 중 DB 오류가 발생했습니다.", DB_ERROR);
  }

  if (!business) {
    throw myError("해당 매장을 찾을 수 없습니다.", NOT_FOUND_ERROR);
  }

  // 역할 기반 접근 제어 로직 유지
  if (userFromReq.role === "admin" || userFromReq.role === "engineer") {
    return business;
  }
  if (business.userId !== userFromReq.id) {
    throw myError("해당 매장에 대한 접근 권한이 없습니다.", FORBIDDEN_ERROR);
  }
  return business;
};

const updateBusiness = async (businessId, userFromReq, updateDto) => {
  const business = await getBusinessById(businessId, userFromReq);

  if (business.userId !== userFromReq.id) {
    throw myError(
      "해당 매장에 대한 수정 권한이 없습니다.",
      UNMATCHING_USER_ERROR
    );
  }

  try {
    const isUpdated = await businessesRepository.updateBusiness(
      businessId,
      userFromReq.id,
      updateDto
    );
    if (!isUpdated) {
      throw myError(
        "매장 정보 업데이트에 실패했습니다. 변경사항이 없거나 대상이 없습니다.",
        NOT_FOUND_ERROR
      );
    }
    return await businessesRepository.findBusinessById(businessId);
  } catch (error) {
    if (error.status) throw error;
    throw myError("매장 수정 중 데이터베이스 오류가 발생했습니다.", DB_ERROR);
  }
};

const deleteBusiness = async (businessId, userFromReq) => {
  const business = await getBusinessById(businessId, userFromReq);

  if (business.userId !== userFromReq.id) {
    throw myError(
      "해당 매장에 대한 삭제 권한이 없습니다.",
      UNMATCHING_USER_ERROR
    );
  }

  try {
    const isDeleted = await businessesRepository.deleteBusiness(
      businessId,
      userFromReq.id
    );
    if (!isDeleted) {
      throw myError("매장 삭제에 실패했습니다.", NOT_FOUND_ERROR);
    }
    return true;
  } catch (error) {
    if (error.status) throw error;
    throw myError("매장 삭제 중 데이터베이스 오류가 발생했습니다.", DB_ERROR);
  }
};

export default {
  registerBusinessWithIceMachines,
  getBusinessesByUserId,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
};
