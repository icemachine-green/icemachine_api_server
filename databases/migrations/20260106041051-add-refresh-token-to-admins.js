export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('admins', 'refresh_token', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: '리프레시 토큰',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('admins', 'refresh_token');
  },
};

