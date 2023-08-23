'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bicycles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Bicycles.belongsTo(models.Station)
      Bicycles.hasMany(models.Rental)
    }
  }
  Bicycles.init({
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: { msg: "please input name" }
      }
    },
    feature: {
      type: DataTypes.TEXT,
      validate: {
        notEmpty: { msg: "please input feature" }
      }
    },
    imageURL: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: { msg: "please input image" }
      }
    },
    description: {
      type: DataTypes.TEXT,
      validate: {
        notEmpty: { msg: "please input description" }
      }
    },
    price: {
      type: DataTypes.TEXT,
      validate: {
        notEmpty: { msg: "please input price" }
      }
    },
    StationId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Bicycles',
  });
  return Bicycles;
};