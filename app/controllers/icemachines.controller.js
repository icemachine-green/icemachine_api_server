/**
 * @file controllers/icemachines.controller.js
 * @description 제빙기 관련 요청을 처리하는 컨트롤러
 * 251230 v1.0.0 Taeho Lee init
 */
import icemachinesService from '../services/icemachines.service.js';
import { createBaseResponse } from '../utils/createBaseResponse.util.js';
import { SUCCESS } from '../../configs/responseCode.config.js';

const getIceMachines = async (req, res, next) => {
    try {
        const { businessId } = req.query; // Query parameter for businessId
        const user = req.user; // User from authMiddleware

        if (!businessId) {
            throw new Error('businessId 쿼리 파라미터가 필요합니다.'); // Basic validation
        }

        const iceMachines = await icemachinesService.getIceMachinesByBusinessId(parseInt(businessId), user);

        return res
            .status(SUCCESS.status)
            .send(createBaseResponse(SUCCESS, iceMachines));
    } catch (error) {
        next(error);
    }
};

const addIceMachine = async (req, res, next) => {
    try {
        const iceMachineDto = req.body;
        const user = req.user;

        const newIceMachine = await icemachinesService.addStandaloneIceMachine(iceMachineDto, user);

        return res
            .status(SUCCESS.status)
            .send(createBaseResponse(SUCCESS, newIceMachine));
    } catch (error) {
        next(error);
    }
};

const updateIceMachine = async (req, res, next) => {
    try {
        const { iceMachineId } = req.params;
        const updateDto = req.body;
        const user = req.user;

        const updatedIceMachine = await icemachinesService.updateIceMachine(
            parseInt(iceMachineId),
            updateDto,
            user
        );

        return res
            .status(SUCCESS.status)
            .send(createBaseResponse(SUCCESS, updatedIceMachine));
    } catch (error) {
        next(error);
    }
};

const deleteIceMachine = async (req, res, next) => {
    try {
        const { iceMachineId } = req.params;
        const user = req.user;

        const result = await icemachinesService.deleteIceMachine(
            parseInt(iceMachineId),
            user
        );

        return res
            .status(SUCCESS.status)
            .send(createBaseResponse(SUCCESS, result));
    } catch (error) {
        next(error);
    }
};

export default {
    getIceMachines,
    addIceMachine,
    updateIceMachine,
    deleteIceMachine,
};