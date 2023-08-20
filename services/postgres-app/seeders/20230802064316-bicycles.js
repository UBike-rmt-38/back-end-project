"use strict";
const data = require("../data/bicycles.json");
data.forEach((el) => {
  el.createdAt = new Date();
  el.updatedAt = new Date();
});

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Bicycles", data, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Bicycles", null, {
      restartIdentity: true,
      cascade: true,
      truncate: true,
    });
  },
};
