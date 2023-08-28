'use strict';
const bcrypt = require('bcrypt')

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Rental, {
        foreignKey: 'UserId'
      })
      User.hasMany(models.Transaction, {
        foreignKey: 'UserId',
      });
    }
  }
  User.init({
    username: {
      type: DataTypes.STRING,
      unique: { msg: "username already taken" },
      validate: {
        notEmpty: { msg: "please input username" }
      }
    },
    role: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: { msg: "email must be unique" },
      validate: {
        notEmpty: { msg: "please input email" },
        isEmail: { msg: "invalid email format" }
      }
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: { msg: "please input password" }
      }
    },
    balance: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User',
  });
  User.beforeCreate((user, option) => {
    const salt = bcrypt.genSaltSync(10)
    const hashPassword = bcrypt.hashSync(user.password, salt)
    user.password = hashPassword
  })
  return User;
};