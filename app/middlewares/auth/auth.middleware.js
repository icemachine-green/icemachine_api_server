/**
 * @file app/middlewares/auth/auth.middleware.js
 * @description JWT 기반 인증 미들웨어
 * 251229 v1.0.0 Lee init
 */
import jwtUtil from '../../utils/jwt/jwt.util.js';
import usersRepository from '../../repositories/users.repository.js';
import myError from '../../errors/customs/my.error.js';
import { UNAUTHORIZED_ERROR } from '../../../configs/responseCode.config.js';

const authMiddleware = async (req, res, next) => {
  try {
    // 1. 헤더에서 토큰 획득
    const token = jwtUtil.getBearerToken(req);

    // 2. 토큰 검증 및 클레임 획득
    const claims = jwtUtil.getClaimWithVerifyToken(token);

    // 3. 클레임의 사용자 ID로 사용자 정보 조회
    const user = await usersRepository.findUserById(claims.sub);

    // 4. 사용자 정보가 없을 경우 에러
    if (!user) {
      throw myError("사용자 정보를 찾을 수 없습니다.", UNAUTHORIZED_ERROR);
    }

    // 5. req 객체에 사용자 정보 주입
    req.user = user;

    // 6. 다음 미들웨어로 제어권 전달
    next();
  } catch (error) {
    // JWT 관련 에러는 jwt.util에서 처리되어 넘어오므로 그대로 next로 전달
    next(error);
  }
};

export default authMiddleware;
