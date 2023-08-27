'use strict';
const fs = require('fs')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const data = JSON.parse(fs.readFileSync('./data/rentals.json', 'utf-8'))
    data.map(e => {
      e.createdAt = new Date()
      e.updatedAt = new Date()
    })
    await queryInterface.bulkInsert('Rentals', data)
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Rentals', null, {
      restartIdentity: true,
      cascade: true,
      truncate: true,
    });
  }
};
