/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    // 1. 'address' 컬럼 이름을 'main_address'로 변경
    await queryInterface.renameColumn('businesses', 'address', 'main_address');

    // 2. 'detailed_address' 컬럼 추가
    await queryInterface.addColumn('businesses', 'detailed_address', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: '상세 주소',
    });

    // 3. 'manager_name' 컬럼 추가
    await queryInterface.addColumn('businesses', 'manager_name', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: '담당자 이름',
    });
  },

  async down (queryInterface, Sequelize) {
    // 1. 'manager_name' 컬럼 제거
    await queryInterface.removeColumn('businesses', 'manager_name');

    // 2. 'detailed_address' 컬럼 제거
    await queryInterface.removeColumn('businesses', 'detailed_address');

    // 3. 'main_address' 컬럼 이름을 'address'로 되돌림
    await queryInterface.renameColumn('businesses', 'main_address', 'address');
  }
};
