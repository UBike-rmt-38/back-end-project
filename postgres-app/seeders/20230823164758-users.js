'use strict';
const bcrypt = require('bcrypt')
const fs = require('fs')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const data = JSON.parse(fs.readFileSync('./data/users.json', 'utf-8'))
    data.map(e => {
      e.createdAt = new Date()
      e.updatedAt = new Date()
      e.password =  bcrypt.hashSync(`${e.password}`, 10)
      return e
    })
    await queryInterface.bulkInsert('Users', data);
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.bulkDelete('Users', null); 
  }
};
