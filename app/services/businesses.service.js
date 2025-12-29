/**
 * @file app/services/businesses.service.js
 * @description 업체 관련 서비스
 * 251229 v1.0.0 Lee init
 */
import businessesRepository from "../repositories/businesses.repository.js";
import db from "../models/index.js"; // for transaction
import myError from "../errors/customs/my.error.js"; // myError import
import {
  NOT_FOUND_ERROR,
  FORBIDDEN_ERROR,
  UNMATCHING_USER_ERROR,
} from "../../configs/responseCode.config.js"; // NOT_FOUND_ERROR, FORBIDDEN_ERROR, UNMATCHING_USER_ERROR import

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
    for (const iceMachineDto of iceMachinesDto) {
      const iceMachineData = {
        businessId: newBusiness.id, // 새로 생성된 매장의 ID를 연결
        modelType: iceMachineDto.model ? "기타" : "모름", // model이 있으면 '기타', 없으면 '모름'으로 가정
        sizeType: iceMachineDto.size || "모름", // 제공된 size를 사용하거나 '모름'
        modelName:
          iceMachineDto.brand && iceMachineDto.model
            ? `${iceMachineDto.brand} ${iceMachineDto.model}` // 브랜드와 모델명 조합
            : iceMachineDto.brand || iceMachineDto.model || "모름", // 둘 중 하나라도 없으면 있는 것을, 둘 다 없으면 '모름'
        // modelPic: iceMachineDto.modelPic, // 선택 사항이므로 DTO에 있다면 추가
      };
      const newIceMachine = await businessesRepository.createIceMachine(
        iceMachineData,
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
  // userFromReq는 authMiddleware가 주입한 사용자 객체
  const business = await businessesRepository.findBusinessById(businessId);

  if (!business) {
    throw myError("해당 매장을 찾을 수 없습니다.", NOT_FOUND_ERROR);
  }

  // 역할 기반 접근 제어
  // 관리자(admin)나 엔지니어(engineer)는 모든 매장을 조회할 수 있습니다.
  if (userFromReq.role === "admin" || userFromReq.role === "engineer") {
    return business;
  }

  // 일반 사용자(customer)의 경우, 소유권 확인을 수행합니다.
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

  // 매장 정보 업데이트는 소유주만 가능하도록 강제 (관리자/엔지니어는 수정하지 않음)
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

  return await businessesRepository.findBusinessById(businessId); // 업데이트된 매장 정보를 반환
};

const deleteBusiness = async (businessId, userFromReq) => {
  const business = await businessesRepository.findBusinessById(businessId);

  if (!business) {
    throw myError("해당 매장을 찾을 수 없습니다.", NOT_FOUND_ERROR);
  }

  // 매장 삭제는 소유주만 가능하도록 강제
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
    throw myError("매장 삭제에 실패했습니다.", NOT_FOUND_ERROR); // 이 경우는 이미 소유권 확인되었으므로 발생하지 않아야 함
  }

  return true; // 삭제 성공
};

export default {
  registerBusinessWithIceMachines,
  getBusinessesByUserId,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
};
