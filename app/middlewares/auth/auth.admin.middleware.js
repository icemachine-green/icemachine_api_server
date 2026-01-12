import jwt from 'jsonwebtoken';
import myError from '../../errors/customs/my.error.js';
import adminRepository from '../../repositories/admin.repository.js';

const authAdminMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

        if (!token) {
            throw myError('인증 토큰이 제공되지 않았습니다.', { status: 401 });
        }

        // 1. 토큰 검증 및 payload 추출
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const adminId = decoded.sub;

        if (!adminId) {
            throw myError('토큰에 사용자 정보가 없습니다.', { status: 401 });
        }

        // 2. DB에서 관리자 조회
        const admin = await adminRepository.findById(adminId);

        // 3. 관리자 존재 및 활성 상태 확인
        if (!admin || !admin.isActive) {
            throw myError('인증 정보가 유효하지 않거나 비활성화된 계정입니다.', { status: 403 });
        }

        // 4. res.locals에 DB에서 조회한 신뢰할 수 있는 정보 저장
        res.locals.admin = {
            id: admin.id,
            username: admin.username,
            name: admin.name,
            role: admin.role,
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return next(myError('유효하지 않거나 만료된 토큰입니다.', { status: 401 }));
        }
        next(error); // 다른 에러는 에러 핸들러로
    }
};

export default authAdminMiddleware;

