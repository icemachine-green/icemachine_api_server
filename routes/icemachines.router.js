/**
 * @file routes/icemachines.router.js
 * @description 제빙기 관련 라우터
 * 251230 v1.0.0 Taeho Lee init
 */
import express from 'express';
import icemachinesController from '../app/controllers/icemachines.controller.js';
import authMiddleware from '../app/middlewares/auth/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, icemachinesController.getIceMachines);
router.post('/', authMiddleware, icemachinesController.addIceMachine);
router.put('/:iceMachineId', authMiddleware, icemachinesController.updateIceMachine);
router.delete('/:iceMachineId', authMiddleware, icemachinesController.deleteIceMachine);

export default router;
