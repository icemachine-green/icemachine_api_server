import AdminRepository from '../repositories/AdminRepository.js';
import bcrypt from 'bcrypt';
import myError from '../errors/customs/my.error.js';
import jwtUtil from '../utils/jwt/jwt.util.js';
import { REISSUE_ERROR } from '../../configs/responseCode.config.js';

const AdminService = {
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
            throw myError('이미 존재하는 사용자 이름입니다.', { status: 409 });
        }

        // 2. 비밀번호 해싱
        const passwordHash = await bcrypt.hash(password, 10);

        // 3. 계정 생성
        const newAdmin = await AdminRepository.create({
            username,
            passwordHash,
            name,
            role: role || 'ADMIN',
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
            throw myError('아이디 또는 비밀번호를 확인해주세요.', { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
        if (!isPasswordValid) {
            throw myError('아이디 또는 비밀번호를 확인해주세요.', { status: 401 });
        }

        await AdminRepository.updateLastLogin(admin.id, loginIp);

        const refreshToken = jwtUtil.generateRefreshToken({ id: admin.id });
        await AdminRepository.updateRefreshToken(admin.id, refreshToken);

        return { admin, refreshToken };
    },

    /**
     * 관리자용 토큰을 재발급합니다.
     * @param {string} token - 쿠키에서 가져온 리프레시 토큰
     * @returns {Promise<{user: object, accessToken: string, refreshToken: string}>}
     */
    reissueAdminToken: async (token) => {
        // 1. DB에서 토큰으로 사용자 조회
        const admin = await AdminRepository.findByRefreshToken(token);
        if (!admin) {
            throw myError("리프레시 토큰이 유효하지 않습니다.", REISSUE_ERROR);
        }

        // 2. 토큰 유효성 검증
        const decoded = jwtUtil.getClaimWithVerifyToken(token);
        
        // 3. DB의 사용자와 토큰의 사용자가 일치하는지 확인
        if (admin.id !== decoded.sub) {
            throw myError("리프레시 토큰의 사용자와 일치하지 않습니다.", REISSUE_ERROR);
        }

        // 4. 새 토큰 생성
        const accessToken = jwtUtil.generateAccessToken({ id: admin.id, role: admin.role });
        const refreshToken = jwtUtil.generateRefreshToken({ id: admin.id });

        // 5. 새 리프레시 토큰 DB에 저장
        await AdminRepository.updateRefreshToken(admin.id, refreshToken);

        return {
            user: { id: admin.id, name: admin.name, role: admin.role },
            accessToken,
            refreshToken
        };
    },
};

export default AdminService;

