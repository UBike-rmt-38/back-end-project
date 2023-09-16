'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Bicycles', 'status', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Bicycles', 'status');
  }
};
