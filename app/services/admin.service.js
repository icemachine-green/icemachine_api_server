import AdminRepository from "../repositories/admin.repository.js";
import bcrypt from "bcrypt";
import myError from "../errors/customs/my.error.js";
import jwtUtil from "../utils/jwt/jwt.util.js";
import { REISSUE_ERROR } from "../../configs/responseCode.config.js";

const adminService = {
  /**
   * 새로운 관리자 계정을 생성합니다. (SUPER_ADMIN만 호출 가능)
   * @param {object} adminData - { username, password, name, role }
   * @returns {Promise<{id: number, name: string}>} - 생성된 관리자의 ID와 이름
   */
  createAdminAccount: async (adminData) => {
    const { username, password, name, role } = adminData;

    // 1. 아이디 중복 체크
    const existingAdmin = await AdminRepository.findByUsername(username);
    if (existingAdmin) {
      throw myError("이미 존재하는 사용자 이름입니다.", { status: 409 });
    }

    // 2. 비밀번호 해싱
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. 계정 생성
    const newAdmin = await AdminRepository.create({
      username,
      passwordHash,
      name,
      role: role || "ADMIN",
      isActive: true,
    });

    return { id: newAdmin.id, name: newAdmin.name };
  },

  /**
   * 관리자 로그인을 처리하고 리프레시 토큰을 발급합니다.
   * @param {string} username - 로그인할 관리자 아이디
   * @param {string} password - 로그인할 관리자 비밀번호
   * @param {string} loginIp - 로그인 요청 IP 주소
   * @returns {Promise<{admin: object, refreshToken: string}>} - 로그인한 관리자 정보 및 리프레시 토큰
   */
  loginAdmin: async (username, password, loginIp) => {
    const admin = await AdminRepository.findByUsername(username);

    if (!admin || !admin.isActive) {
      throw myError("아이디 또는 비밀번호를 확인해주세요.", { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      throw myError("아이디 또는 비밀번호를 확인해주세요.", { status: 401 });
    }

    await AdminRepository.updateLastLogin(admin.id, loginIp);

    const refreshToken = jwtUtil.generateRefreshToken({ id: admin.id });
    await AdminRepository.updateRefreshToken(admin.id, refreshToken);

    return { admin, refreshToken };
  },

  /**
   * 관리자용 토큰을 재발급합니다. (일반 유저 로직과 분리)
   * @param {string} token - 쿠키에서 가져온 리프레시 토큰
   * @returns {Promise<{admin: object, accessToken: string, refreshToken: string}>}
   */
  reissueAdminToken: async (token) => {
    // 1. DB에서 리프레시 토큰으로 관리자 조회
    const admin = await AdminRepository.findByRefreshToken(token);
    if (!admin) {
      console.error("[Admin Reissue] DB에 일치하는 토큰 없음");
      throw myError("리프레시 토큰이 유효하지 않습니다.", REISSUE_ERROR);
    }

    // 2. JWT 유효성 및 클레임(sub) 검증
    const decoded = jwtUtil.getClaimWithVerifyToken(token);

    // 3. DB 관리자 ID와 토큰 내 sub(ID) 비교 (타입 일치를 위해 Number 처리)
    if (Number(admin.id) !== Number(decoded.sub)) {
      console.error("[Admin Reissue] ID 불일치:", admin.id, decoded.sub);
      throw myError("리프레시 토큰의 정보가 일치하지 않습니다.", REISSUE_ERROR);
    }

    // 4. 새로운 토큰 세트 생성
    const accessToken = jwtUtil.generateAccessToken({
      id: admin.id,
      role: admin.role,
    });
    const refreshToken = jwtUtil.generateRefreshToken({ id: admin.id });

    // 5. DB에 새 리프레시 토큰 업데이트
    await AdminRepository.updateRefreshToken(admin.id, refreshToken);

    return {
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
      },
      accessToken,
      refreshToken,
    };
  },
};

export default adminService;
