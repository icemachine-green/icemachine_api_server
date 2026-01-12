/**
 * @file app/middlewares/auth/auth.admin.middleware.js
 * @description 관리자 전용 JWT 기반 인증 미들웨어
 * 260113 v1.0.0 Lee init
 */
import jwtUtil from "../../utils/jwt/jwt.util.js";
import adminRepository from "../../repositories/admin.repository.js";
import myError from "../../errors/customs/my.error.js";
import { UNAUTHORIZED_ERROR } from "../../../configs/responseCode.config.js";

/**
 * 관리자 인증 미들웨어
 * 기존 auth.middleware.js와 동일한 jwtUtil을 사용하여 일관성 유지
 */
const authAdminMiddleware = async (req, res, next) => {
  try {
    // 1. 유틸리티를 사용하여 헤더에서 베어러 토큰 획득 및 형식 검증
    const token = jwtUtil.getBearerToken(req);

    // 2. 토큰 검증 및 클레임(payload) 획득 (만료/변조 에러는 유틸에서 처리됨)
    const claims = jwtUtil.getClaimWithVerifyToken(token);

    // 3. 클레임의 sub(ID)로 관리자 정보 조회
    // 관리자는 전용 레포지토리인 adminRepository를 사용
    const admin = await adminRepository.findById(claims.sub);

    // 4. 관리자 존재 여부 및 활성 상태 체크
    if (!admin) {
      throw myError("관리자 정보를 찾을 수 없습니다.", UNAUTHORIZED_ERROR);
    }

    if (!admin.isActive) {
      throw myError("비활성화된 관리자 계정입니다.", UNAUTHORIZED_ERROR);
    }

    /**
     * 5. [핵심] req.admin 객체에 관리자 정보 주입
     * 컨트롤러에서 req.admin.id 로 접근 가능하도록 설정
     */
    req.admin = {
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role,
    };

    // 6. 다음 로직(컨트롤러)으로 이동
    next();
  } catch (error) {
    // jwtUtil에서 던진 에러(토큰만료 등)를 그대로 전역 에러 핸들러로 전달
    next(error);
  }
};

export default authAdminMiddleware;
