"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Bicycle extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Bicycle.belongsTo(models.Category)
      Bicycle.hasMany(models.Rental)
    }
  }
  Bicycle.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: true,
          notEmpty: true,
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      feature: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      imageURL: DataTypes.STRING,
      CategoryId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Categories',
          key: 'id'
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "Bicycle",
    }
  );
  return Bicycle;
};
