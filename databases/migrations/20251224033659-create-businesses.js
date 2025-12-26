import { DataTypes } from 'sequelize'; // DataTypes import를 파일 상단으로 이동

const tableName = 'businesses';

const attributes = {
  id: {
    field: 'id',
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: '업체 PK',
  },
  user_id: {
    field: 'user_id',
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Users 테이블의 PK (소유주)',
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  name: {
    field: 'name',
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '업체명',
  },
  address: {
    field: 'address',
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '업체 주소',
  },
  phone_number: {
    field: 'phone_number',
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '업체 연락처',
  },
  createdAt: {
    field: 'created_at',
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    field: 'updated_at',
    type: DataTypes.DATE,
    allowNull: false,
  },
  deletedAt: {
    field: 'deleted_at',
    type: DataTypes.DATE,
    allowNull: true,
  },
};

const options = {
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  engine: 'InnoDB',
};

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, attributes, options);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(tableName);
  },
};
