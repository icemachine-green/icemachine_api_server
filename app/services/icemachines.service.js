/**
 * @file services/icemachines.service.js
 * @description 제빙기 관련 비즈니스 로직 (상세 에러 매핑)
 * 260110 v1.0.1 Taeho Lee update
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
  const business = await businessesRepository.findBusinessById(businessId);
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
  return await icemachinesRepository.findIceMachinesByBusinessId(businessId);
};

const addIceMachineToBusiness = async (
  businessId,
  iceMachineDto,
  transaction
) => {
  try {
    const iceMachineData = {
      businessId: businessId,
      brandName: iceMachineDto.brand || iceMachineDto.brandName,
      modelName: iceMachineDto.model || iceMachineDto.modelName,
      sizeType: iceMachineDto.size || iceMachineDto.sizeType,
      modelType: iceMachineDto.modelType || "STANDALONE",
    };
    return await icemachinesRepository.createIceMachine(
      iceMachineData,
      transaction
    );
  } catch (error) {
    // 🚩 에러 원인을 상세히 담아 던짐
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

  // 권한 체크 등 로직... (동일)
  try {
    await icemachinesRepository.updateIceMachine(iceMachineId, updateDto);
    return await icemachinesRepository.findIceMachineById(iceMachineId);
  } catch (error) {
    throw myError(`[DB_UPDATE_FAIL] ${error.message}`, DB_ERROR);
  }
};

const deleteIceMachine = async (iceMachineId, user) => {
  const iceMachine = await icemachinesRepository.findIceMachineById(
    iceMachineId
  );
  if (!iceMachine)
    throw myError("해당 제빙기를 찾을 수 없습니다.", NOT_FOUND_ERROR);

  // 권한 체크...
  await icemachinesRepository.deleteIceMachine(iceMachineId);
  return { message: "제빙기가 성공적으로 삭제되었습니다." };
};

export default {
  getIceMachinesByBusinessId,
  addIceMachineToBusiness,
  addStandaloneIceMachine,
  updateIceMachine,
  deleteIceMachine,
};
