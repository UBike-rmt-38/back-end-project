'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Station extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Station.hasMany(models.Bicycles, {
        foreignKey: 'StationId'
       })
    }
  }
  Station.init({
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: { msg: "please input name" }
      }
    },
    address: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: { msg: "please input address" }
      }
    },
    latitude: {
      type: DataTypes.FLOAT,
      validate: {
        notEmpty: { msg: "please input latitude" }
      }
    },
    longitude: {
      type: DataTypes.FLOAT,
      validate: {
        notEmpty: { msg: "please input longtitude" }
      }
    }
  }, {
    sequelize,
    modelName: 'Station',
  });
  return Station;
};