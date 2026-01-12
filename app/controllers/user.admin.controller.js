import userAdminService from "../services/user.admin.service.js";
import { createBaseResponse } from "../utils/createBaseResponse.util.js";
import { SUCCESS } from "../../configs/responseCode.config.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

const userAdminController = {
  /**
   * 고객 목록 조회 (검색/필터/정렬/페이징)
   */
  getUsers: asyncHandler(async (req, res) => {
    // 🚩 쿼리 파라미터: userName, businessName, address, startDate, endDate, sort, page, limit
    const result = await userAdminService.getUsers(req.query);
    return res.status(SUCCESS.status).send(createBaseResponse(SUCCESS, result));
  }),

  /**
   * 고객 상세 조회
   */
  getUserDetail: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const detail = await userAdminService.getUserDetail(id);
    return res.status(SUCCESS.status).send(createBaseResponse(SUCCESS, detail));
  }),
};

export default userAdminController;
