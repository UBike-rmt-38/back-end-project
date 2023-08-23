'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Rental extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Rental.belongsTo(models.User)
      Rental.belongsTo(models.Bicycle)
    }
  }
  Rental.init({
    status: {
      type: DataTypes.STRING,
      defaultValue: true
    },
    travelledDistance: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: { msg: "please input distance" }
      }
    },
    totalPrice: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: { msg: "please input total price" }
      }
    },
    UserId: DataTypes.INTEGER,
    BicycleId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Rental',
  });
  return Rental;
};