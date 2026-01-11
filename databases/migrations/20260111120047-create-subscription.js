/**
 * @file databases/migrations/20260111120047-create-subscription.js
 * @description 'subscriptions' 테이블 생성
 */
import { DataTypes } from 'sequelize';

const tableName = 'subscriptions';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      endpoint: {
        type: DataTypes.STRING(500),
        allowNull: false,
        unique: true,
      },
      p256dh: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      auth: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      user_agent: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(tableName);
  },
};
