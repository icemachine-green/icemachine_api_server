/** @type {import('sequelize-cli').Migration} */
export default { // Use export default for ES module syntax
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('reviews', 'reservation_id');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('reviews', 'reservation_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'reservations',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Reservations 테이블의 PK (외래키)',
    });
  },
};
