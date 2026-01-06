/**
 * @file app/models/Admin.js
 * @description 'admins' 테이블 모델
 * 251222 v1.0.0 Lee-init
 */
import dayjs from 'dayjs';
import { DataTypes } from 'sequelize';

const modelName = 'Admin';

const attributes = {
  id: {
    field: 'id',
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: '관리자 PK',
  },
  username: {
    field: 'username',
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: '로그인 아이디',
  },
  passwordHash: {
    field: 'password_hash',
    type: DataTypes.STRING,
    allowNull: false,
    comment: '해시된 비밀번호',
  },
  refreshToken: {
    field: 'refresh_token',
    type: DataTypes.STRING,
    allowNull: true,
    comment: '리프레시 토큰',
  },
  name: {
    field: 'name',
    type: DataTypes.STRING,
    allowNull: false,
    comment: '관리자 실명',
  },
  role: {
    field: 'role',
    type: DataTypes.ENUM('SUPER_ADMIN', 'ADMIN'),
    allowNull: false,
    comment: '관리자 권한',
  },
  isActive: {
    field: 'is_active',
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '계정 활성/비활성 여부',
  },
  lastLoginAt: {
    field: 'last_login_at',
    type: DataTypes.DATE,
    allowNull: true,
    get() {
      const val = this.getDataValue('lastLoginAt');
      if (!val) return null;
      return dayjs(val).format('YYYY-MM-DD HH:mm:ss');
    },
    comment: '마지막 로그인 시간',
  },
  lastLoginIp: {
    field: 'last_login_ip',
    type: DataTypes.STRING,
    allowNull: true,
    comment: '마지막 로그인 IP',
  },
  createdAt: {
    field: 'created_at',
    type: DataTypes.DATE,
    allowNull: false,
    get() {
      return dayjs(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
    },
  },
  updatedAt: {
    field: 'updated_at',
    type: DataTypes.DATE,
    allowNull: false,
    get() {
      return dayjs(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss');
    },
  },
  deletedAt: {
    field: 'deleted_at',
    type: DataTypes.DATE,
    allowNull: true,
    get() {
      const val = this.getDataValue('deletedAt');
      if (!val) return null;
      return dayjs(val).format('YYYY-MM-DD HH:mm:ss');
    },
  },
};

const options = {
  tableName: 'admins',
  timestamps: true,
  paranoid: true,
};

const Admin = {
  init: (sequelize) => {
    return sequelize.define(modelName, attributes, options);
  },

  associate: (db) => {
    // Associations for Admin model if any
  },
};

export default Admin;
