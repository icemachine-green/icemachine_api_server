/**
 * @file services/icemachines.service.js
 * @description 제빙기 관련 비즈니스 로직
 * 251230 v1.0.0 Taeho Lee init
 */
import icemachinesRepository from '../repositories/icemachines.repository.js';
import businessesRepository from '../repositories/businesses.repository.js';
import myError from '../errors/customs/my.error.js';
import { NOT_FOUND_ERROR, FORBIDDEN_ERROR } from '../../configs/responseCode.config.js';

const getIceMachinesByBusinessId = async (businessId, user) => {
    // 1. 사업장이 존재하는지 확인
    const business = await businessesRepository.findBusinessById(businessId);
    if (!business) {
        throw new myError('해당 매장을 찾을 수 없습니다.', NOT_FOUND_ERROR);
    }

    // 2. 권한 확인 (관리자, 엔지니어, 또는 매장 소유주만 접근 가능)
    const isOwner = business.userId === user.id;
    const isAdminOrEngineer = user.role === 'admin' || user.role === 'engineer';

    if (!isOwner && !isAdminOrEngineer) {
        throw new myError('해당 매장의 제빙기 정보에 접근할 권한이 없습니다.', FORBIDDEN_ERROR);
    }

    // 3. 제빙기 목록 조회
    const iceMachines = await icemachinesRepository.findIceMachinesByBusinessId(businessId);
    return iceMachines;
};

const addIceMachineToBusiness = async (businessId, iceMachineDto, transaction) => {
    const iceMachineData = {
        businessId: businessId,
        modelType: iceMachineDto.model ? "기타" : "모름",
        sizeType: iceMachineDto.size || "모름",
        modelName:
            iceMachineDto.brand && iceMachineDto.model
                ? `${iceMachineDto.brand} ${iceMachineDto.model}`
                : iceMachineDto.brand || iceMachineDto.model || "모름",
    };
    const newIceMachine = await icemachinesRepository.createIceMachine(iceMachineData, transaction);
    return newIceMachine;
};

const addStandaloneIceMachine = async (iceMachineDto, user) => {
    const { businessId } = iceMachineDto;
    if (!businessId) {
        throw new myError('요청 본문에 businessId가 포함되어야 합니다.', 400);
    }
    
    // 1. 사업장이 존재하는지 확인
    const business = await businessesRepository.findBusinessById(businessId);
    if (!business) {
        throw new myError('해당 매장을 찾을 수 없습니다.', NOT_FOUND_ERROR);
    }

    // 2. 권한 확인 (관리자, 엔지니어, 또는 매장 소유주만 접근 가능)
    const isOwner = business.userId === user.id;
    const isAdminOrEngineer = user.role === 'admin' || user.role === 'engineer';

    if (!isOwner && !isAdminOrEngineer) {
        throw new myError('해당 매장에 제빙기를 추가할 권한이 없습니다.', FORBIDDEN_ERROR);
    }

    // 3. 제빙기 생성 (기존 함수 재사용)
    // 이 경우에는 독립적으로 호출되었으므로 트랜잭션(t)을 전달하지 않습니다.
    const newIceMachine = await addIceMachineToBusiness(businessId, iceMachineDto);
    return newIceMachine;
};

const updateIceMachine = async (iceMachineId, updateDto, user) => {
    // 1. 제빙기가 존재하는지 확인
    const iceMachine = await icemachinesRepository.findIceMachineById(iceMachineId);
    if (!iceMachine) {
        throw new myError('해당 제빙기를 찾을 수 없습니다.', NOT_FOUND_ERROR);
    }

    // 2. 제빙기가 속한 사업장을 찾아 권한 확인
    const business = await businessesRepository.findBusinessById(iceMachine.businessId);
    if (!business) {
        // 이 경우는 데이터 무결성에 문제가 있는 상황이지만, 에러 처리를 해줍니다.
        throw new myError('제빙기에 연결된 사업장을 찾을 수 없습니다.', NOT_FOUND_ERROR);
    }

    const isOwner = business.userId === user.id;
    const isAdminOrEngineer = user.role === 'admin' || user.role === 'engineer';

    if (!isOwner && !isAdminOrEngineer) {
        throw new myError('해당 제빙기를 수정할 권한이 없습니다.', FORBIDDEN_ERROR);
    }

    // 3. 제빙기 정보 업데이트
    await icemachinesRepository.updateIceMachine(iceMachineId, updateDto);

    // 4. 업데이트된 정보 다시 조회하여 반환
    const updatedIceMachine = await icemachinesRepository.findIceMachineById(iceMachineId);
    return updatedIceMachine;
};

const deleteIceMachine = async (iceMachineId, user) => {
    // 1. 제빙기가 존재하는지 확인
    const iceMachine = await icemachinesRepository.findIceMachineById(iceMachineId);
    if (!iceMachine) {
        throw new myError('해당 제빙기를 찾을 수 없습니다.', NOT_FOUND_ERROR);
    }

    // 2. 제빙기가 속한 사업장을 찾아 권한 확인
    const business = await businessesRepository.findBusinessById(iceMachine.businessId);
    if (!business) {
        throw new myError('제빙기에 연결된 사업장을 찾을 수 없습니다.', NOT_FOUND_ERROR);
    }

    const isOwner = business.userId === user.id;
    const isAdminOrEngineer = user.role === 'admin' || user.role === 'engineer';

    if (!isOwner && !isAdminOrEngineer) {
        throw new myError('해당 제빙기를 삭제할 권한이 없습니다.', FORBIDDEN_ERROR);
    }

    // 3. 제빙기 삭제
    await icemachinesRepository.deleteIceMachine(iceMachineId);

    return { message: '제빙기가 성공적으로 삭제되었습니다.' };
};

export default {
    getIceMachinesByBusinessId,
    addIceMachineToBusiness,
    addStandaloneIceMachine,
    updateIceMachine,
    deleteIceMachine,
};
