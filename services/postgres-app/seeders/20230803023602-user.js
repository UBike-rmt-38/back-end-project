'use strict';
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
const data = require('../data/users.json')
data.forEach((el) => {
  el.createdAt = new Date();
  el.updatedAt = new Date();
  el.password = bcrypt.hashSync(el.password, salt);
});


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Users", data, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {
      restartIdentity: true,
      cascade: true,
      truncate: true,
    });
  }
};
