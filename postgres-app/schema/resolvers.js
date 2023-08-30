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
const redis = require('../config/ioredis')

const resolvers = {
  Query: {
    getStations: async (_, __, context) => {
      try {
        const { user, error } = await context;
        if (!user) {
          throw new AuthenticationError(error.message);
        }
        const dataCache = await redis.get('app:stations')
        if (dataCache) {
          const data = JSON.parse(dataCache)
          return data
        }
        const data = await Station.findAll({ include: { model: Bicycles } });
        await redis.set('app:stations', JSON.stringify(data))
        return data;
      } catch (err) {
        throw err
      }
    },
    getCategories: async (_, __, context) => {
      try {
        const { user, error } = await context;
        if (!user) {
          throw new AuthenticationError(error.message);
        }
        const dataCache = await redis.get('app:categories')
        if (dataCache) {
          const data = JSON.parse(dataCache)
          return data
        }
        const data = await Category.findAll({ include: { model: Bicycles } });
        await redis.set('app:categories', JSON.stringify(data))
        return data;
      } catch (err) {
        throw err
      }
    },
    getBicycles: async (_, __, context) => {
      try {
        const { user, error } = await context;
        if (!user) {
          throw new AuthenticationError(error.message);
        }
        const dataCache = await redis.get('app:bicycles')
        if (dataCache) {
          const data = JSON.parse(dataCache)
          return data
        }
        const data = await Bicycles.findAll();
        await redis.set('app:bicycles', JSON.stringify(data))

        return data;
      } catch (err) {
        throw err
      }
    },
    getBicycleById: async (_, args, context) => {
      try {
        const { user, error } = await context;
        if (!user) {
          throw new AuthenticationError(error.message);
        }
        const { bicycleId } = args
        const dataCache = await redis.get('app:bicyclebyid:' + bicycleId)
        console.log(dataCache, 'data');

        if (dataCache) {
          const data = JSON.parse(dataCache)
          console.log(data, 'cek dalam if');
          if (data.id === bicycleId) {
            return data
          } else {
            await redis.del('app:bicyclebyid:' + bicycleId);
            const data = await Bicycles.findByPk(bicycleId, {
              include: [{ model: Station }, { model: Category }],
            });
            if (data) await redis.set('app:bicyclebyid:' + bicycleId , JSON.stringify(data))
    
            return data
          }
        } else {
          const data = await Bicycles.findByPk(bicycleId, {
            include: [{ model: Station }, { model: Category }],
          });
          if (data) await redis.set('app:bicyclebyid:' + bicycleId, JSON.stringify(data))
  
          return data
        }
      } catch (err) {
        console.log(err);
        throw err
      }
    },
    getUsers: async (_, __, context) => {
      try {
        const { user, error } = await context;
        if (!user) {
          throw new AuthenticationError(error.message);
        }
        const dataCache = await redis.get('app:users')
        if (dataCache) {
          const data = JSON.parse(dataCache)
          return data
        }
        const data = await User.findAll();
        await redis.set('app:users', JSON.stringify(data))

        return data;
      } catch (err) {
        throw err;
      }
    },
    getUsersDetails: async (_, __, context) => {
      try {
        const { user, error } = await context;
        if (!user) {
          throw new AuthenticationError(error.message);
        }
        const dataCache = await redis.get('app:userdetail')
        if (dataCache) {
          const data = JSON.parse(dataCache)
          if (data.id === user.id) {
            return data;
          } else {
            await redis.del('app:userdetail')
          }
        }
        const data = await User.findByPk(user.id, {
          include: [{ model: Transaction }, { model: Rental }],
        });
        await redis.set('app:userdetail', JSON.stringify(data))

        return data;
      } catch (err) {
        throw err;
      }
    },
    getRentals: async (_, __, context) => {
      try {
        const { user, error } = await context;
        if (!user) {
          throw new AuthenticationError(error.message);
        }
        const dataCache = await redis.get('app:rentals')
        if (dataCache) {
          const data = JSON.parse(dataCache)
          return data
        }
        const data = await Rental.findAll();
        await redis.set('app:rentals', JSON.stringify(data))

        return data;
      } catch (err) {
        throw err;
      }
    },
    getStationsById: async (_, args, context) => {
      try {
        const { user, error } = await context;
        if (!user) {
          throw new AuthenticationError(error.message);
        }
        const { stationId } = args;

        const dataCache = await redis.get('app:stationbyid:' + stationId)
        if (dataCache) {
          const data = JSON.parse(dataCache)
          if (data.id === stationId) {
            return data
          } else {
            await redis.del('app:stationbyid:' + stationId);
            const data = await Station.findByPk(stationId, {
              include: {
                model: Bicycles,
              },
            });
            await redis.set('app:stationbyid:' + stationId, JSON.stringify(data))
    
            return data;
          }
        } else {
          const data = await Station.findByPk(stationId, {
            include: {
              model: Bicycles,
            },
          });
          await redis.set('app:stationbyid:' + stationId, JSON.stringify(data))
  
          return data;
        }
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

        const dataCache = await redis.get('app:categorybyid:' + categoryId)
        if (dataCache) {
          const data = JSON.parse(dataCache)
          if (data.id === categoryId) {
            return data
          } else {
            await redis.del('app:categorybyid:' + categoryId);
          }
        }
        const data = await Category.findByPk(categoryId, {
          include: {
            model: Bicycles,
          },
        });
        await redis.set('app:categorybyid:' + categoryId, JSON.stringify(data))

        return data;
      } catch (err) {
        throw err;
      }
    },
    getTransactions: async (_, __, context) => {
      try {
        const { user, error } = await context;
        if (!user) {
          throw new AuthenticationError(error.message);
        }
        const dataCache = await redis.get('app:transactions')
        if (dataCache) {
          const data = JSON.parse(dataCache)
          return data
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
        await redis.set('app:transactions', JSON.stringify(data))
        return data;
      } catch (err) {
        throw err
      }
    },
    userHistoryTransaction: async (_, __, context) => {
      try {
        const { user, error } = await context;
        if (!user) {
          throw new AuthenticationError(error.message);
        }
        const dataCache = await redis.get('app:userhistorytransaction')
        if (dataCache) {
          const data = JSON.parse(dataCache)
          if (data.id === user.id) {
            return data
          } else {
            await redis.del('app:userhistorytransaction');
          }
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
        await redis.set('app:userhistorytransaction', JSON.stringify(data))

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
        const dataCache = await redis.get('app:qrcode')
        if (dataCache) {
          const data = JSON.parse(dataCache)
          return data
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
        await redis.set('app:qrcode', JSON.stringify(stationQrcode))

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

        const dataCache = await redis.get('app:rentalreport')
        if (dataCache) {
          const data = JSON.parse(dataCache)
          return data
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
        await redis.set('app:rentalreport', JSON.stringify(data))

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
        await redis.del('app:stations');

        return "Station created";
      } catch (err) {
        throw err;
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
        await redis.del('app:stations');
        await redis.del('app:stationbyid:' + stationId);

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
        await redis.del('app:stations');

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
        await redis.del('app:categories');
        

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
        await redis.del('app:categories');
        await redis.del('app:categorybyid:' + categoryId);

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
        await redis.del('app:categories');

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
        const { name, feature, imageURL, description, price, StationId, categoryId } = args;
        await Bicycles.create({
          name,
          feature,
          imageURL,
          description,
          price,
          StationId,
          categoryId
        });
        await redis.del('app:bicycles');

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
          categoryId
        } = args;
        await Bicycles.update(
          { name, feature, imageURL, description, price, StationId, categoryId },
          { where: { id: bicycleId } }
        );
        await redis.del('app:bicycles');
        await redis.del('app:bicyclebyid:' + bicycleId)

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
        await redis.del('app:bicycles');
        return `bicycle with id ${bicycleId} has been successfully deleted.`;
      } catch (err) {
        console.log(err);
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
        await redis.del('app:users');

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
          stationToken,
          travelledDistance,
          totalPrice,
          transaction,
        } = args;
        const { user, error } = await context;
        if (!user) {
          throw new AuthenticationError(error.message);
        }
        const payload = jwt.verify(stationToken, JWT_KEY);

        const rental = await Rental.findByPk(rentalId);
        if (transaction === "Cash") {
          await Rental.update(
            { status: true, travelledDistance, totalPrice, transaction },
            { where: { id: rentalId } },
            { transaction: t }
          );
          await Bicycles.update(
            { status: true, StationId: payload.id },
            { where: { id: rental.BicycleId } },
            { transaction: t }
          );
          await t.commit();
          await redis.del('app:rentalreport');
          await redis.del('app:rentals');

          return "Rent done";
        }
        const newBalance = user.balance - totalPrice;
        await Rental.update(
          { status: true, travelledDistance, totalPrice, transaction },
          { where: { id: rentalId } },
          { transaction: t }
        );
        await Bicycles.update(
          { status: true, StationId: payload.id },
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
        await redis.del('app:rentalreport');
        await redis.del('app:rentals');
        await redis.del('app:bicycles');
        await redis.del('app:users');
        await redis.del('app:userdetail');
        await redis.del('app:transactions');
        await redis.del('app:userhistorytransaction');

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
        await redis.del('app:users');
        await redis.del('app:userdetail');
        await redis.del('app:transactions');
        await redis.del('app:userhistorytransaction');
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
        await redis.del('app:users');
        await redis.del('app:userdetail');
        return 'Password has been changed'
      } catch (err) {
        throw err
      }
    }
  },
};

module.exports = resolvers;
