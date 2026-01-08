import AdminService from "../services/admin.service.js";
import { createBaseResponse } from "../utils/createBaseResponse.util.js";
import { SUCCESS, REISSUE_ERROR } from "../../configs/responseCode.config.js";
import myError from "../errors/customs/my.error.js";
import jwtUtil from "../utils/jwt/jwt.util.js";
import cookieUtil from "../utils/cookie/cookie.util.js";

const adminController = {
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

      const adminPayload = {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        lastLoginAt: admin.lastLoginAt,
      };

      return res
        .status(SUCCESS.status)
        .send(
          createBaseResponse(
            SUCCESS,
            { accessToken, admin: adminPayload },
            "로그인 성공"
          )
        );
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/admin/reissue - 관리자 토큰 재발급
   */
  reissue: async (req, res, next) => {
    try {
      // 1. 쿠키에서 관리자용 토큰 획득
      const token = cookieUtil.getCookieRefreshToken(req);
      if (!token) {
        throw myError("리프레시 토큰이 없습니다.", REISSUE_ERROR);
      }

      // 2. 서비스 로직 실행 (admin 데이터 반환)
      const { admin, accessToken, refreshToken } =
        await AdminService.reissueAdminToken(token);

      // 3. 관리자 전용 쿠키 설정 (path: "/" 설정 적용)
      cookieUtil.setAdminCookieRefreshToken(res, refreshToken);

      // 4. 프론트엔드 Redux(authSlice) 구조에 맞춰 응답
      return res.status(SUCCESS.status).send(
        createBaseResponse(SUCCESS, {
          accessToken,
          admin, // 프론트엔드에서 state.admin으로 바로 저장됨
        })
      );
    } catch (error) {
      next(error);
    }
  },
};

export default adminController;
