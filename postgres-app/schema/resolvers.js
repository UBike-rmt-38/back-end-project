"use strict";
const bcrypt = require("bcrypt");
const { AuthenticationError } = require("apollo-server");
const {
  User,
  Bicycles,
  Rental,
  Station,
  sequelize,
  Transaction,
  Category,
} = require("../models/index");
const { signToken } = require("../helpers/jwt");
const generateMidtransToken = require("../helpers/generateMidtransToken");
const QRCode = require("qrcode");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const JWT_KEY = process.env.JWT_SECRET;

const resolvers = {
  Query: {
    getStations: async (_, __, context) => {
      const { user, error } = await context;
      console.log(context, "cek context");
      if (!user) {
        throw new AuthenticationError(error.message);
      }
      const data = await Station.findAll({ include: { model: Bicycles } });
      return data;
    },
    getCategories: async (_, __, context) => {
      const { user, error } = await context;
      if (!user) {
        throw new AuthenticationError(error.message);
      }
      const data = await Category.findAll({ include: { model: Bicycles } });
      return data;
    },
    getBicycles: async (_, __, context) => {
      const { user, error } = await context;
      if (!user) {
        throw new AuthenticationError(error.message);
      }
      const data = await Bicycles.findAll();
      return data;
    },
    getUsers: async (_, __, context) => {
      const { user, error } = await context;
      if (!user) {
        throw new AuthenticationError(error.message);
      }
      const data = await User.findAll();
      return data;
    },
    getUsersDetails: async (_, __, context) => {
      try {
        const { user, error } = await context;
        if (!user) {
          throw new AuthenticationError(error.message);
        }
        const data = await User.findByPk(user.id, {
          include: [{ model: Transaction }, { model: Rental }],
        });
        console.log(data.Transactions);
        return data;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    getRentals: async (_, __, context) => {
      const { user, error } = await context;
      if (!user) {
        throw new AuthenticationError(error.message);
      }
      const data = await Rental.findAll();
      return data;
    },
    getStationsById: async (_, args, context) => {
      try {
        const { user, error } = await context;
        if (!user) {
          throw new AuthenticationError(error.message);
        }
        const { stationId } = args;
        const data = await Station.findByPk(stationId, {
          include: {
            model: Bicycles,
          },
        });
        return data;
      } catch (err) {
        throw err;
      }
    },
    getCategoriesById: async (_, args, context) => {
      try {
        const { user, error } = await context;
        if (!user) {
          throw new AuthenticationError(error.message);
        }
        const { categoryId } = args;
        // if (!categoryId) throw new AuthenticationError;
        const data = await Category.findByPk(categoryId, {
          include: {
            model: Bicycles,
          },
        });
        return data;
      } catch (err) {
        throw err;
      }
    },
    getCategoriesById: async (_, args, context) => {
      try {
        const { user, error } = await context;
        if (!user) {
          throw new AuthenticationError(error.message);
        }
        const { categoryId } = args;
        const data = await Category.findByPk(categoryId, {
          include: {
            model: Bicycles,
          },
        });
        return data;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    getTransactions: async (_, __, context) => {
      const { user, error } = await context;
      if (!user) {
        throw new AuthenticationError(error.message);
      }
      const data = await Transaction.findAll({
        include: [
          {
            model: User,
            attributes: {
              exclude: ["password"],
            },
          },
        ],
      });
      return data;
    },
    userHistoryTransaction: async (_, args, context) => {
      try {
        const { user, error } = await context;
        if (!user) {
          throw new AuthenticationError(error.message);
        }
        const data = await Transaction.findAll({
          where: { UserId: user.id },
          include: [
            {
              model: User,
              attributes: {
                exclude: ["password"],
              },
            },
          ],
        });
        return data;
      } catch (err) {
        throw err;
      }
    },
    getStationQrCode: async (_, __, context) => {
      try {
        const { user, error } = await context;
        if (!user) {
          throw new AuthenticationError(error.message);
        }
        const data = await Station.findAll({ include: { model: Bicycles } });
        const stationQrcode = await Promise.all(
          data.map(async (e) => {
            const token = jwt.sign({ id: e.id }, JWT_KEY);
            const bicycle = e.Bicycles;
            const bicycleQrcode = await Promise.all(
              bicycle.map(async (e) => {
                const bicycleToken = jwt.sign(
                  { id: e.id, status: e.status },
                  JWT_KEY
                );
                const bicyleQrcode = await QRCode.toDataURL(bicycleToken);
                return { qrCode: bicyleQrcode, name: e.name };

              })
            );
            const qrCodeString = await QRCode.toDataURL(token);
            return { qrCode: qrCodeString, name: e.name, bicycleQrcode };
          })
        );
        return stationQrcode;
      } catch (err) {
        throw err;
      }
    },
    getRentalReport: async (_, __, context) => {
      try {
        const { user, error } = await context;
        if (!user) {
          throw new AuthenticationError(error.message);
        }

        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        const data = await Rental.findAll({
          where: {
            createdAt: {
              [Op.between]: [sevenDaysAgo, today],
            },
          },
        });
        return data;
      } catch (err) {
        throw err;
      }
    },
  },
  Mutation: {
    addStation: async (_, args, context) => {
      try {
        const { user, error } = await context;
        if (!user || user.role === "User") {
          throw new AuthenticationError("Authorization token invalid");
        }
        const { name, address, latitude, longitude } = args;
        await Station.create({ name, address, latitude, longitude });
        return "Station created";
      } catch (err) {
        throw err;
      }
    },
    addCategory: async (_, args, context) => {
      try {
        const { user, error } = await context;
        if (!user || user.role === "User") {
          throw new AuthenticationError("Authorization token invalid");
        }
        const { name, description } = args;
        await Category.create({ name, description });
        return "Category created";
      } catch (error) {
        throw error;
      }
    },
    editStation: async (_, args, context) => {
      try {
        const { user, error } = await context;
        const { name, address, latitude, longitude, stationId } = args;
        if (!user || user.role === "User") {
          throw new AuthenticationError("Authorization token invalid");
        }
        await Station.update(
          { name, address, latitude, longitude },
          { where: { id: stationId } }
        );
        return `station with id ${stationId} has been updated`;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    deleteStation: async (_, args, context) => {
      try {
        const { user, error } = await context;
        if (!user || user.role === "User") {
          throw new AuthenticationError("Authorization token invalid");
        }
        const { stationId } = args;
        await Station.destroy({ where: { id: stationId } });
        return `station with id ${stationId} has been deleted`;
      } catch (err) {
        throw err;
      }
    },
    addCategory: async (_, args, context) => {
      try {
        const { user, error } = await context;
        if (!user || user.role === "User") {
          throw new AuthenticationError("Authorization token invalid");
        }
        const { name, description } = args;
        await Category.create({ name, description });
        return "Category created";
      } catch (err) {
        throw err;
      }
    },
    editCategory: async (_, args, context) => {
      try {
        const { user, error } = await context;
        const { name, description, categoryId } = args;
        if (!user || user.role === "User") {
          throw new AuthenticationError("Authorization token invalid");
        }
        await Category.update(
          { name, description },
          { where: { id: categoryId } }
        );
        return `Category with id ${categoryId} has been updated`;
      } catch (err) {
        throw err;
      }
    },
    deleteCategory: async (_, args, context) => {
      try {
        const { user, error } = await context;
        const { categoryId } = args;
        if (!user || user.role === "User") {
          throw new AuthenticationError("Authorization token invalid");
        }
        await Category.destroy({ where: { id: categoryId } });
        return `Category with id ${categoryId} has been successfully deleted.`;
      } catch (err) {
        throw err;
      }
    },
    addBicycle: async (_, args, context) => {
      try {
        const { user, error } = await context;
        if (!user || user.role === "User") {
          throw new AuthenticationError("Authorization token invalid");
        }
        const { name, feature, imageURL, description, price, StationId } = args;
        await Bicycles.create({
          name,
          feature,
          imageURL,
          description,
          price,
          StationId,
        });
        return "Bicycle created";
      } catch (err) {
        throw err;
      }
    },
    editBicycle: async (_, args, context) => {
      try {
        const { user, error } = await context;
        if (!user || user.role === "User") {
          throw new AuthenticationError("Authorization token invalid");
        }
        const {
          name,
          feature,
          imageURL,
          description,
          price,
          StationId,
          bicycleId,
        } = args;
        await Bicycles.update(
          { name, feature, imageURL, description, price, StationId },
          { where: { id: bicycleId } }
        );
        return `Bicycle with id ${bicycleId} has been updated`;
      } catch (err) {
        throw err;
      }
    },
    deleteBicycle: async (_, args, context) => {
      try {
        const { user, error } = await context;
        const { bicycleId } = args;
        if (!user || user.role === "User") {
          throw new AuthenticationError("Authorization token invalid");
        }
        await Bicycles.destroy({ where: { id: bicycleId } });
        return `bicycle with id ${bicycleId} has been successfully deleted.`;
      } catch (err) {
        throw err;
      }
    },

    deleteCategory: async (_, args, context) => {
      try {
        const { user, error } = await context;
        const { categoryId } = args;
        if (!user || user.role === "User") {
          throw new AuthenticationError("Authorization token invalid");
        }
        await Category.destroy({ where: { id: categoryId } });
        return `Category with id ${categoryId} has been successfully deleted.`;
      } catch (err) {
        throw err;
      }
    },
    createUser: async (_, args) => {
      try {
        const { username, email, password, role } = args;
        if (!role) {
          await User.create({ username, role: "User", email, password });
          return "User created";
        }
        await User.create({ username, role, email, password });
        return "Admin created";
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    createRental: async (_, args, context) => {
      const t = await sequelize.transaction();
      try {
        const { user, error } = await context;
        if (!user) {
          throw new AuthenticationError(error.message);
        }
        const { bicycleToken } = args;
        const payload = jwt.verify(bicycleToken, JWT_KEY);
        const verifyBicycle = await Bicycles.findByPk(payload.id);
        if (verifyBicycle.status === false) throw new AuthenticationError('Bicycle unavailable')
        await Rental.create(
          { UserId: user.id, BicycleId: payload.id },
          { transaction: t }
        );
        await Bicycles.update(
          { status: false },
          { where: { id: payload.id } },
          { transaction: t }
        );
        await t.commit();

        return "Rent start";
      } catch (err) {
        t.rollback();
        console.log(err);
        throw err;
      }
    },
    doneRental: async (_, args, context) => {
      const t = await sequelize.transaction();
      try {
        const {
          rentalId,
          StationId,
          travelledDistance,
          totalPrice,
          transaction,
        } = args;
        const { user, error } = await context;
        if (!user) {
          throw new AuthenticationError(error.message);
        }

        const rental = await Rental.findByPk(rentalId);
        if (transaction === "Cash") {
          await Rental.update(
            { status: true, travelledDistance, totalPrice, transaction },
            { where: { id: rentalId } },
            { transaction: t }
          );
          await Bicycles.update(
            { status: true, StationId },
            { where: { id: rental.BicycleId } },
            { transaction: t }
          );
          await t.commit();
          return "Rent done";
        }
        const newBalance = user.balance - totalPrice;
        await Rental.update(
          { status: true, travelledDistance, totalPrice, transaction },
          { where: { id: rentalId } },
          { transaction: t }
        );
        await Bicycles.update(
          { status: true, StationId },
          { where: { id: rental.BicycleId } },
          { transaction: t }
        );
        await Transaction.create(
          { action: "Payment", amount: totalPrice, UserId: user.id },
          { transaction: t }
        );
        await User.update(
          { balance: newBalance },
          { where: { id: user.id } },
          { transaction: t }
        );
        await t.commit();

        return "Rent done";
      } catch (err) {
        t.rollback();
        throw err;
      }
    },
    login: async (_, args) => {
      try {
        const { username, password } = args;
        const user = await User.findOne({ where: { username } });
        if (!user) throw "invalid usernamepassword";
        const verifyPassword = bcrypt.compareSync(password, user.password);
        if (!verifyPassword) throw "invalid usernamepassword";
        const access_token = signToken(user);
        return access_token;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    generateMidtranToken: async (_, args, context) => {
      try {
        const { amount } = args;
        const { user, error } = context;
        if (!user) {
          throw new AuthenticationError(error.message);
        }
        const midtransToken = await generateMidtransToken(user, amount);

        console.log(midtransToken);
        return midtransToken;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    topUpBalance: async (_, args, context) => {
      const t = await sequelize.transaction();
      try {
        const { amount } = args;
        const { user, error } = context;
        if (!user) {
          throw new AuthenticationError(error.message);
        }
        const verifyUser = await User.findByPk(user.id, { transaction: t });
        const newBalance = (verifyUser.balance || 0) + amount;
        await User.update(
          { balance: newBalance },
          { where: { id: user.id } },
          { transaction: t }
        );
        await Transaction.create(
          { action: "Deposit", amount, UserId: user.id },
          { transaction: t }
        );
        await t.commit();
        return `success top up with amount ${amount}`;
      } catch (err) {
        t.rollback();
        console.log(err);
        throw err;
      }
    },
    changePassword: async (_, args, context) => {
      try {
        const { oldPassword, newPassword } = args;
        const { user, error } = context;
        if (!user) {
          throw new AuthenticationError(error.message);
        }
        const getUser = await User.findByPk(user.id)
        const verifyPassword = bcrypt.compareSync(oldPassword, getUser.password)
        if (!verifyPassword) throw new AuthenticationError('Invalid old password')

        const salt = bcrypt.genSaltSync(10)
        const hashPassword = bcrypt.hashSync(newPassword, salt)
        await User.update({ password: hashPassword }, { where: { id: user.id } })
        return 'Password has been changed'
      } catch (err) {
        throw err
      }
    }
  },
};

module.exports = resolvers;
