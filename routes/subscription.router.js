import express from 'express';
import subscriptionController from '../app/controllers/subscription.controller.js';
import authMiddleware from '../app/middlewares/auth/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, subscriptionController.createSubscription);

export default router;