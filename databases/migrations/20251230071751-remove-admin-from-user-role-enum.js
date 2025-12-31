'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // MySQL specific way to alter ENUM column values
    await queryInterface.sequelize.query(
      "ALTER TABLE users MODIFY COLUMN role ENUM('customer', 'engineer') NOT NULL DEFAULT 'customer';"
    );
  },

  async down(queryInterface, Sequelize) {
    // Revert to original ENUM values
    await queryInterface.sequelize.query(
      "ALTER TABLE users MODIFY COLUMN role ENUM('customer', 'engineer', 'admin') NOT NULL DEFAULT 'customer';"
    );
  }
};