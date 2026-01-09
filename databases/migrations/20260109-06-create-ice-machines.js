/**
 * @file databases/migrations/20251222053027-create-ice-machines.js
 */
import { DataTypes } from "sequelize";

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ice_machines", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      business_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "businesses", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      // 🚩 브랜드명 컬럼 추가
      brand_name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "제빙기 브랜드 (호시자키, 카이저 등)",
      },
      // 🚩 모델명 컬럼 (브랜드 제외 순수 모델명)
      model_name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "상세 모델명 (IM-45NE 등)",
      },
      // 🚩 정책 테이블과 일치시키기 위해 ENUM 사용
      size_type: {
        type: DataTypes.ENUM("소형", "중형", "대형"),
        allowNull: false,
      },
      model_pic: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false },
      deleted_at: { type: DataTypes.DATE, allowNull: true },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("ice_machines");
  },
};
