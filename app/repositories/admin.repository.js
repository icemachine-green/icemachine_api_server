import db from '../models/index.js';

const Admin = db.Admin;

const adminRepository = {
    /**
     * 사용자 이름으로 관리자를 조회합니다.
     * @param {string} username - 조회할 사용자 이름
     * @returns {Promise<Admin|null>}
     */
    findByUsername: async (username) => {
        return await Admin.findOne({
            where: { username }
        });
    },

    /**
     * 새로운 관리자 계정을 생성합니다.
     * @param {object} adminData - 생성할 관리자 데이터 (username, passwordHash, name, role)
     * @returns {Promise<Admin>}
     */
    create: async (adminData) => {
        return await Admin.create(adminData);
    },

    /**
     * ID로 관리자를 조회합니다. (로그인, 권한 확인 등에 사용)
     * @param {number} id - 관리자 ID
     * @returns {Promise<Admin|null>}
     */
    findById: async (id) => {
        return await Admin.findByPk(id);
    },

    /**
     * 관리자의 lastLoginAt 및 lastLoginIp를 업데이트합니다.
     * @param {number} id - 관리자 ID
     * @param {string} lastLoginIp - 마지막 로그인 IP
     * @returns {Promise<boolean>} 업데이트 성공 여부
     */
    updateLastLogin: async (id, lastLoginIp) => {
        const [updatedRows] = await Admin.update(
            { lastLoginAt: new Date(), lastLoginIp: lastLoginIp },
            { where: { id } }
        );
        return updatedRows > 0;
    },

    /**
     * 관리자 계정의 활성화 상태를 조회합니다.
     * @param {number} id - 관리자 ID
     * @returns {Promise<boolean>} 활성화 상태 여부
     */
    isActive: async (id) => {
        const admin = await Admin.findByPk(id);
        return admin ? admin.isActive : false;
    },

    /**
     * 리프레시 토큰으로 관리자를 조회합니다.
     * @param {string} token - 리프레시 토큰
     * @returns {Promise<Admin|null>}
     */
    findByRefreshToken: async (token) => {
        return await Admin.findOne({ where: { refreshToken: token } });
    },

    /**
     * 관리자의 리프레시 토큰을 업데이트합니다.
     * @param {number} id - 관리자 ID
     * @param {string|null} refreshToken - 새로운 리프레시 토큰
     * @returns {Promise<boolean>}
     */
    updateRefreshToken: async (id, refreshToken) => {
        const [updatedRows] = await Admin.update({ refreshToken }, { where: { id } });
        return updatedRows > 0;
    },
};

export default adminRepository;
