import { DataTypes } from "sequelize";

const tableName = "schedules";

const attributes = {
  id: {
    field: "id",
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "예약 고유 식별자",
  },
  customer_id: {
    field: "customer_id",
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users", // Assumes 'users' is the table name for User model
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE", // or RESTRICT or CASCADE
    comment: "예약 요청 고객 ID",
  },
  engineer_id: {
    field: "engineer_id",
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "users", // Assumes 'users' is the table name for User model
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL", // or RESTRICT or CASCADE
    comment: "배정된 엔지니어 ID",
  },
  service_id: {
    field: "service_id",
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "services", // Assumes 'services' is the table name for Service model
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE", // or RESTRICT or CASCADE
    comment: "요청한 서비스 ID",
  },
  visit_datetime: {
    field: "visit_datetime",
    type: DataTypes.DATE,
    allowNull: false,
    comment: "방문 예정 일시",
  },
  address: {
    field: "address",
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: "서비스 받을 주소",
  },
  ice_machine_model: {
    field: "ice_machine_model",
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: "제빙기 모델명",
  },
  ice_machine_size: {
    field: "ice_machine_size",
    type: DataTypes.ENUM("SMALL", "MEDIUM", "LARGE"),
    allowNull: true,
    comment: "제빙기 사이즈",
  },
  special_request: {
    field: "special_request",
    type: DataTypes.TEXT,
    allowNull: true,
    comment: "고객 요청 사항",
  },
  status: {
    field: "status",
    type: DataTypes.ENUM("REQUESTED", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELED"),
    allowNull: false,
    comment: "예약 상태",
  },
  createdAt: {
    field: "created_at",
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    field: "updated_at",
    type: DataTypes.DATE,
    allowNull: false,
  },
  deletedAt: {
    field: "deleted_at",
    type: DataTypes.DATE,
    allowNull: true,
  },
};

const options = {
  charset: "utf8mb4",
  collate: "utf8mb4_unicode_ci",
  engine: "InnoDB",
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
