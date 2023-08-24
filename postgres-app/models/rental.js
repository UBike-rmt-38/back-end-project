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
      // Rental.belongsTo(models.User, {
      //   foreignKey: 'UserId'
      // })
      // Rental.belongsTo(models.Bicycle, {
      //   foreignKey: 'BicycleId'
      // })
    }
  }
  Rental.init({
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    travelledDistance: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: { msg: "please input distance" }
      }
    },
    totalPrice: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: { msg: "please input total price" }
      }
    },
    UserId: DataTypes.INTEGER,
    BicycleId: DataTypes.INTEGER,
    transaction: {
      type: DataTypes.STRING, 
      allowNull: true,       
    }
  }, {
    sequelize,
    modelName: 'Rental',
  });
  return Rental;
};

