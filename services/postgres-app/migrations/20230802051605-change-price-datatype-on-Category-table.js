"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Categories", "price", {
      type: Sequelize.FLOAT,
      allowNull: false,
      validate: {
        notNull: true,
        notEmpty: true,
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Categories", "price", {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        notNull: true,
        notEmpty: true,
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },
};
