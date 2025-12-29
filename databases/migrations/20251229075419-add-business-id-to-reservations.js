'use strict';

/** @type {import('sequelize-cli').Migration} */
export default { // Use export default for ES module syntax
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('reservations', 'business_id', {
      type: Sequelize.INTEGER,
      allowNull: false, // 예약은 반드시 특정 업체에 귀속되어야 함
      references: {
        model: 'businesses', // 참조할 모델 이름 (테이블 이름)
        key: 'id', // 참조할 컬럼
      },
      onUpdate: 'CASCADE', // 부모 키 업데이트 시 자식도 업데이트
      onDelete: 'CASCADE', // 부모 키 삭제 시 자식도 삭제
      comment: 'Businesses 테이블의 PK (외래키)',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('reservations', 'business_id');
  }
};
