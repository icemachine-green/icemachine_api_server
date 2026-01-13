/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("reservations", "cancel_reason", {
      type: Sequelize.TEXT, // STRING 또는 TEXT (사유 길이에 따라 선택)
      allowNull: true,
      comment: "예약 취소 사유 (status = CANCELED)",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("reservations", "cancel_reason");
  },
};