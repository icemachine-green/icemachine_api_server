import { DataTypes } from 'sequelize';

const USERS_TABLE_NAME = 'users';
const ICE_MACHINES_TABLE_NAME = 'ice_machines';
const BUSINESSES_TABLE_NAME = 'businesses';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. users 테이블에서 address 컬럼 제거
      await queryInterface.removeColumn(USERS_TABLE_NAME, 'address', { transaction });

      // 2. ice_machines 테이블에서 user_id 컬럼 제거
      await queryInterface.removeColumn(ICE_MACHINES_TABLE_NAME, 'user_id', { transaction });

      // 3. ice_machines 테이블에 business_id 컬럼 추가 (외래키 포함)
      await queryInterface.addColumn(ICE_MACHINES_TABLE_NAME, 'business_id', {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Businesses 테이블의 PK (외래키)',
        references: {
          model: BUSINESSES_TABLE_NAME,
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. ice_machines 테이블에서 business_id 컬럼 제거
      await queryInterface.removeColumn(ICE_MACHINES_TABLE_NAME, 'business_id', { transaction });

      // 2. ice_machines 테이블에 user_id 컬럼 다시 추가
      await queryInterface.addColumn(ICE_MACHINES_TABLE_NAME, 'user_id', {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Users 테이블의 PK (외래키)',
        references: {
          model: USERS_TABLE_NAME,
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }, { transaction });

      // 3. users 테이블에 address 컬럼 다시 추가
      await queryInterface.addColumn(USERS_TABLE_NAME, 'address', {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '주소',
      }, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
