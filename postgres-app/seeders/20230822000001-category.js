'use strict';
const fs = require('fs')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const data = JSON.parse(fs.readFileSync('./data/categories.json', 'utf-8'))
    data.map(e => {
      e.createdAt = new Date()
      e.updatedAt = new Date()
    })
    await queryInterface.bulkInsert('Categories', data)
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', null, {
      restartIdentity: true,
      cascade: true,
      truncate: true,
    });
  }
};
