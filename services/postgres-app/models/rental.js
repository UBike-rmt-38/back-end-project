"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Rental extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Rental.belongsTo(models.User);
      Rental.belongsTo(models.Bicycle);
    }
  }
  Rental.init(
    {
      status: {
        type: DataTypes.STRING,
        defaultValue: "Active",
      },
      travelledDistance: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      totalPrice: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      UserId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      BicycleId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Bicycles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "Rental",
    }
  );

  Rental.beforeCreate(async (instance) => {
    try {
      const bicycle = await sequelize.models.Bicycle.findByPk(
        instance.BicycleId,
        {
          include: sequelize.models.Category
        }
      );
      instance.totalPrice = Math.ceil(
        bicycle.Category.price * instance.travelledDistance
      );
    } catch (error) {
      throw error;
    }
  });

  return Rental;
};
