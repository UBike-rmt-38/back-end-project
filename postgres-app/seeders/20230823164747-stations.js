'use strict';
const fs = require('fs')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const data = JSON.parse(fs.readFileSync('./data/station.json', 'utf-8'))
    data.map(e => {
      e.createdAt = new Date()
      e.updatedAt = new Date()
    })
    await queryInterface.bulkInsert('Stations', data)
  },

  async down (queryInterface, Sequelize) {
      await queryInterface.bulkDelete('Stations', null);
  }
};
