import myError from '../../errors/customs/my.error.js';

/**
 * 특정 역할(role)을 가진 사용자만 접근할 수 있도록 하는 미들웨어 팩토리 함수입니다.
 * @param {string[]} allowedRoles - 접근을 허용할 역할 배열 (예: ['SUPER_ADMIN', 'ADMIN'])
 * @returns {function} - Express 미들웨어 함수
 */
const verifyRole = (allowedRoles) => (req, res, next) => {
    try {
        const userRole = res.locals.admin?.role; // 인증 미들웨어에서 설정된 사용자 역할

        if (!userRole) {
            // 역할 정보가 없으면 (즉, 인증되지 않았거나 역할이 설정되지 않음)
            throw myError('인증 정보가 없거나 유효하지 않습니다.', { status: 401 });
        }

        if (!allowedRoles.includes(userRole)) {
            // 허용된 역할에 포함되지 않으면
            throw myError('접근 권한이 없습니다.', { status: 403 });
        }

        next(); // 권한이 있으면 다음 미들웨어 또는 라우트 핸들러로
    } catch (error) {
        next(error);
    }
};

export default verifyRole;
