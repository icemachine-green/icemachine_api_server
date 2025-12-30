/**
 * @file controllers/admin.controller.js
 * @description 관리자 관련 컨트롤러
 * 251230 v1.0.0 jung init
 */

import adminService from "../services/admin.service.js";

  async function getCustomers(req, res, next) {
    try {
      const users = await adminService.getAllCustomers();
      res.status(200).json({ data: users });
    } catch (error) {
        next(error);
    }
  }

export default {
  getCustomers,
}