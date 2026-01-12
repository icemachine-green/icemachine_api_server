import engineerAdminService from "../services/engineer.admin.service.js";
import { createBaseResponse } from "../utils/createBaseResponse.util.js";
import { SUCCESS } from "../../configs/responseCode.config.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

const engineerAdminController = {
  getEngineers: asyncHandler(async (req, res) => {
    const { page, limit, ...filters } = req.query;
    const result = await engineerAdminService.getEngineers(
      page,
      limit,
      filters
    );
    return res.status(SUCCESS.status).send(createBaseResponse(SUCCESS, result));
  }),

  getEngineerDetail: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const detail = await engineerAdminService.getEngineerDetail(id);
    return res.status(SUCCESS.status).send(createBaseResponse(SUCCESS, detail));
  }),

  updateEngineerInfo: asyncHandler(async (req, res) => {
    const { id } = req.params;
    await engineerAdminService.updateEngineerInfo(id, req.body);
    return res
      .status(SUCCESS.status)
      .send(
        createBaseResponse(
          SUCCESS,
          null,
          "기사 정보가 성공적으로 수정되었습니다."
        )
      );
  }),

  updateEngineerStatus: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, resignationDate } = req.body;
    await engineerAdminService.updateEngineerStatus(
      id,
      status,
      resignationDate
    );
    return res
      .status(SUCCESS.status)
      .send(createBaseResponse(SUCCESS, null, "기사 상태가 변경되었습니다."));
  }),
};

export default engineerAdminController;
