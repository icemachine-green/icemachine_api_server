/**
 * @file routes/businesses.router.js
 * @description 업체 관련 라우터
 * 251229 v1.0.0 Lee init
 */
import express from "express";
import businessesController from "../app/controllers/businesses.controller.js";
import authMiddleware from "../app/middlewares/auth/auth.middleware.js"; // authMiddleware import

const router = express.Router();

router.post("/", authMiddleware, businessesController.registerBusiness);
router.get("/", authMiddleware, businessesController.getBusinesses);
router.get("/:businessId", authMiddleware, businessesController.getBusiness);
router.put("/:businessId", authMiddleware, businessesController.updateBusiness);
router.delete(
  "/:businessId",
  authMiddleware,
  businessesController.deleteBusiness
);

export default router;
