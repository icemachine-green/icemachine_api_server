/**
 * @file app/services/icemachines.service.js
 */
import icemachinesRepository from "../repositories/icemachines.repository.js";
import businessesRepository from "../repositories/businesses.repository.js";
import myError from "../errors/customs/my.error.js";
import {
  NOT_FOUND_ERROR,
  FORBIDDEN_ERROR,
  DB_ERROR,
  BAD_REQUEST_ERROR,
} from "../../configs/responseCode.config.js";

const getIceMachinesByBusinessId = async (businessId, user) => {
  if (!businessId) throw myError("businessId가 필요합니다.", BAD_REQUEST_ERROR);

  let business;
  try {
    business = await businessesRepository.findBusinessById(businessId);
  } catch (error) {
    throw myError("매장 정보 조회 중 DB 오류가 발생했습니다.", DB_ERROR);
  }

  if (!business)
    throw myError("해당 매장을 찾을 수 없습니다.", NOT_FOUND_ERROR);

  const isOwner = business.userId === user.id;
  const isAdminOrEngineer = user.role === "admin" || user.role === "engineer";

  if (!isOwner && !isAdminOrEngineer) {
    throw myError(
      "해당 매장의 정보에 접근할 권한이 없습니다.",
      FORBIDDEN_ERROR
    );
  }

  try {
    return await icemachinesRepository.findIceMachinesByBusinessId(businessId);
  } catch (error) {
    throw myError("제빙기 목록 조회 중 DB 오류가 발생했습니다.", DB_ERROR);
  }
};

const addIceMachineToBusiness = async (
  businessId,
  iceMachineDto,
  transaction
) => {
  const iceMachineData = {
    businessId: businessId,
    brandName: iceMachineDto.brand || iceMachineDto.brandName,
    modelName: iceMachineDto.model || iceMachineDto.modelName,
    sizeType: iceMachineDto.size || iceMachineDto.sizeType,
    modelType: iceMachineDto.modelType || "STANDALONE",
  };

  try {
    return await icemachinesRepository.createIceMachine(
      iceMachineData,
      transaction
    );
  } catch (error) {
    throw myError(`[DB_INSERT_FAIL] ${error.message}`, DB_ERROR);
  }
};

const addStandaloneIceMachine = async (iceMachineDto, user) => {
  const { businessId } = iceMachineDto;
  if (!businessId) throw myError("businessId가 필요합니다.", BAD_REQUEST_ERROR);

  const business = await businessesRepository.findBusinessById(businessId);
  if (!business)
    throw myError("해당 매장을 찾을 수 없습니다.", NOT_FOUND_ERROR);

  const isOwner = business.userId === user.id;
  const isAdminOrEngineer = user.role === "admin" || user.role === "engineer";

  if (!isOwner && !isAdminOrEngineer) {
    throw myError("권한이 없습니다.", FORBIDDEN_ERROR);
  }

  return await addIceMachineToBusiness(businessId, iceMachineDto);
};

const updateIceMachine = async (iceMachineId, updateDto, user) => {
  const iceMachine = await icemachinesRepository.findIceMachineById(
    iceMachineId
  );
  if (!iceMachine)
    throw myError("해당 제빙기를 찾을 수 없습니다.", NOT_FOUND_ERROR);

  // 권한 체크 로직 (예약 관리 및 업체 관리와 일관성 유지)
  // 비즈니스 소유주인지 확인하는 로직이 필요할 경우 추가 가능 (기존 로직 준수)

  try {
    await icemachinesRepository.updateIceMachine(iceMachineId, updateDto);
    return await icemachinesRepository.findIceMachineById(iceMachineId);
  } catch (error) {
    if (error.status) throw error;
    throw myError(`[DB_UPDATE_FAIL] ${error.message}`, DB_ERROR);
  }
};

const deleteIceMachine = async (iceMachineId, user) => {
  const iceMachine = await icemachinesRepository.findIceMachineById(
    iceMachineId
  );
  if (!iceMachine)
    throw myError("해당 제빙기를 찾을 수 없습니다.", NOT_FOUND_ERROR);

  try {
    await icemachinesRepository.deleteIceMachine(iceMachineId);
    return { message: "제빙기가 성공적으로 삭제되었습니다." };
  } catch (error) {
    throw myError("제빙기 삭제 중 DB 오류가 발생했습니다.", DB_ERROR);
  }
};

export default {
  getIceMachinesByBusinessId,
  addIceMachineToBusiness,
  addStandaloneIceMachine,
  updateIceMachine,
  deleteIceMachine,
};
