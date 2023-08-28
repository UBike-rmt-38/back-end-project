'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Category.hasMany(models.Bicycles)
    }
  }
  Category.init({
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: { msg: 'please input name' }
      }
    },
    description: {
      type: DataTypes.TEXT,
      validate: {
        notEmpty: { msg: 'please input desciption' }
      }
    },
  }, {
    sequelize,
    modelName: 'Category',
  });
  return Category;
};