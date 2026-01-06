import AdminService from "../services/AdminService.js";
import { createBaseResponse } from "../utils/createBaseResponse.util.js";
import { SUCCESS, REISSUE_ERROR } from "../../configs/responseCode.config.js";
import myError from "../errors/customs/my.error.js";
import jwtUtil from "../utils/jwt/jwt.util.js";
import cookieUtil from "../utils/cookie/cookie.util.js";

const AdminController = {
  /**
   * POST /api/admin/accounts - 새로운 관리자 계정 생성
   */
  createAdminAccount: async (req, res, next) => {
    try {
      const requestingAdminRole = res.locals.admin?.role;
      if (requestingAdminRole !== "SUPER_ADMIN") {
        throw myError("SUPER_ADMIN 권한이 필요합니다.", { status: 403 });
      }

      const { username, password, name, role } = req.body;

      const newAdmin = await AdminService.createAdminAccount({
        username,
        password,
        name,
        role,
      });

      return res
        .status(SUCCESS.status)
        .send(
          createBaseResponse(
            SUCCESS,
            newAdmin,
            "관리자 계정이 성공적으로 생성되었습니다."
          )
        );
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/admin/login - 관리자 로그인
   */
  loginAdmin: async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const loginIp = req.ip;

      const { admin, refreshToken } = await AdminService.loginAdmin(
        username,
        password,
        loginIp
      );

      const accessToken = jwtUtil.generateAccessToken({
        id: admin.id,
        role: admin.role,
        username: admin.username,
      });

      cookieUtil.setAdminCookieRefreshToken(res, refreshToken);

      return res
        .status(SUCCESS.status)
        .send(createBaseResponse(SUCCESS, { accessToken }, "로그인 성공"));
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/admin/reissue - 관리자 토큰 재발급
   */
  reissue: async (req, res, next) => {
    try {
      const token = cookieUtil.getCookieRefreshToken(req);
      if (!token) {
        throw myError("리프레시 토큰이 없습니다.", REISSUE_ERROR);
      }

      const { user, accessToken, refreshToken } =
        await AdminService.reissueAdminToken(token);

      cookieUtil.setAdminCookieRefreshToken(res, refreshToken);

      return res
        .status(SUCCESS.status)
        .send(createBaseResponse(SUCCESS, { accessToken, user }));
    } catch (error) {
      next(error);
    }
  },
};

export default AdminController;
