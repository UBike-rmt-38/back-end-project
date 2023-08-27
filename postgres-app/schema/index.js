"use strict";
const bcrypt = require('bcrypt')
const { AuthenticationError } = require('apollo-server');
const { User, Bicycles, Rental, Station, sequelize, Transaction } = require('../models/index');
const { signToken } = require('../helpers/jwt');
const generateMidtransToken = require('../helpers/generateMidtransToken');

const typeDefs = `#graphql
type Stations {
    id: Int 
    name: String
    address: String
    latitude: Float
    longitude: Float
    Bicycles: [Bicycles]
    createdAt: String
    updatedAt: String
}

type Bicycles {
    id: Int
    name: String
    feature: String
    imageURL: String
    description: String
    price: Int
    StationId: Int
    status: Boolean
    createdAt: String
    updatedAt: String
}

type Users {
    id: Int
    username: String
    role: String
    email: String
    password: String 
    balance: Int
}

type Rentals {
    id: Int
    status: Boolean
    travelledDistance: Int
    totalPrice: Int
    UserId: Int
    BicycleId: Int 
    transaction: String
    createdAt: String
    updatedAt: String
}

type Transactions {
    id: Int
    action: String
    amount: Int
    UserId: Int
    User: Users
}

type MidtranToken {
    token: String
    redirect_url: String
}

type Query {
    getStations: [Stations]
    getBicycles: [Bicycles]
    getUsers: [Users]
    getRentals: [Rentals]
    getStationsById(stationId: Int): Stations
    getTransactions: [Transactions]
    userHistoryTransaction(UserId: Int): [Transactions]
}

type Mutation {
    addStation(
        name: String!
        address: String!
        latitude: Float!
        longitude: Float!
    ): String
    
    editStation(
        stationId: Int!
        name: String!
        address: String!
        latitude: Float!
        longitude: Float!
    ): String

    deleteStation(stationId: Int!): String

    addBicycle(
        name: String!
        feature: String!
        imageURL: String!
        description: String!
        price: Int!
       StationId: Int!
    ): String

    editBicycle(
        bicycleId: Int!
        name: String!
        feature: String!
        imageURL: String!
        description: String!
        price: Int!
       StationId: Int!
    ): String

    deleteBicycle(bicycleId: Int!): String

    createUser(
        username: String!
        email: String!
        password: String! 
        role: String
    ): String

    createRental(
        BicycleId: Int!
    ): String

    doneRental(
        travelledDistance: Int!
        totalPrice: Int!
        rentalId: Int!
        StationId: Int!
        transaction: String!
    ): String

    login(
        username: String!
        password: String!
    ): String

    generateMidtranToken(
        amount: Int
    ): MidtranToken

    topUpBalance(amount: Int!): String
}
`

const resolvers = {
    Query: {
        getStations: async (_, __, context) => {
            const { user, error } = await context
            if (!user) { throw new AuthenticationError(error.message); }
            const data = await Station.findAll({ include: { model: Bicycles } })
            return data
        },
        getBicycles: async (_, __, context) => {
            const { user, error } = await context
            if (!user) { throw new AuthenticationError(error.message); }
            const data = await Bicycles.findAll()
            return data
        },
        getUsers: async (_, __, context) => {
            const { user, error } = await context
            if (!user) { throw new AuthenticationError(error.message); }
            const data = await User.findAll()
            return data
        },
        getRentals: async (_, __, context) => {
            const { user, error } = await context
            if (!user) { throw new AuthenticationError(error.message); }
            const data = await Rental.findAll()
            return data
        },
        getStationsById: async (_, args, context) => {
            try {
                const { user, error } = await context
                if (!user) { throw new AuthenticationError(error.message); }
                const { stationId } = args
                const data = await Station.findByPk(stationId, {
                    include: {
                        model: Bicycles
                    }
                })
                return data
            } catch (err) {
                throw err
            }
        },
        getTransactions: async (_, __, context) => {
            const { user, error } = await context
            if (!user) { throw new AuthenticationError(error.message); }
            const data = await Transaction.findAll({
                include: [
                  {
                    model: User,
                    attributes: {
                      exclude: ['password']
                    },
                  },
                ],
              })
            return data
        },
        userHistoryTransaction: async (_,args,context) => {
            try{
                const { user, error } = await context
                if (!user) { throw new AuthenticationError(error.message); }
                const {UserId} = args
                const data = await Transaction.findAll({where: {UserId}, include: [
                    {
                      model: User,
                      attributes: {
                        exclude: ['password']
                      },
                    },
                  ],});
                  return data
            } catch(err) {
                console.log(err);
                throw err
            }
        }
    },
    Mutation: {
        addStation: async (_, args, context) => {
            try {
                const { user, error } = await context
                if (!user || user.role === 'User') { throw new AuthenticationError('Authorization token invalid'); }
                const { name, address, latitude, longitude } = args
                await Station.create({ name, address, latitude, longitude })
                return 'Station created'
            } catch (err) {
                throw err
            }
        },
        editStation: async (_, args, context) => {
            try {
                const { user, error } = await context
                const { name, address, latitude, longitude, stationId } = args
                if (!user || user.role === 'User') { throw new AuthenticationError('Authorization token invalid'); }
                await Station.update({ name, address, latitude, longitude }, { where: { id: stationId } })
                return `station with id ${stationId} has been updated`
            } catch (err) {
                console.log(err);
                throw err
            }
        },
        deleteStation: async (_, args, context) => {
            try {
                const { user, error } = await context
                if (!user || user.role === 'User') { throw new AuthenticationError('Authorization token invalid'); }
                const { stationId } = args
                await Station.destroy({ where: { id: stationId } })
                return `station with id ${stationId} has been deleted`
            } catch (err) {
                console.log(err);
                throw err
            }
        },
        addBicycle: async (_, args, context) => {
            try {
                const { user, error } = await context
                if (!user || user.role === 'User') { throw new AuthenticationError('Authorization token invalid'); }
                const { name, feature, imageURL, description, price, StationId } = args
                await Bicycles.create({ name, feature, imageURL, description, price, StationId })
                return 'Bicycle created'
            } catch (err) {
                console.log(err);
                throw err
            }
        },
        editBicycle: async (_, args, context) => {
            try {
                const { user, error } = await context
                if (!user || user.role === 'User') { throw new AuthenticationError('Authorization token invalid'); }
                const { name, feature, imageURL, description, price, StationId, bicycleId } = args
                await Bicycles.update({ name, feature, imageURL, description, price, StationId }, { where: { id: bicycleId } })
                return `Bicycle with id ${bicycleId} has been updated`
            } catch (err) {
                console.log(err);
                throw err
            }
        },
        deleteBicycle: async (_, args, context) => {
            try {
                const { user, error } = await context
                const { bicycleId } = args
                if (!user || user.role === 'User') { throw new AuthenticationError('Authorization token invalid'); }
                await Bicycles.destroy({ where: { id: bicycleId } })
                return `bicycle with id ${bicycleId} has been successfully deleted.`
            } catch (err) {
                console.log(err);
                throw err
            }
        },
        createUser: async (_, args) => {
            try {
                const { username, email, password, role } = args
                if (!role) {
                    await User.create({ username, role: 'User', email, password })
                    return 'User created'
                }
                await User.create({ username, role, email, password })
                return 'Admin created'
            } catch (err) {
                console.log(err);
                throw err
            }
        },
        createRental: async (_, args, context) => {
            const t = await sequelize.transaction()
            try {
                const { user, error } = await context
                const { BicycleId } = args
                if (!user) { throw new AuthenticationError(error.message); }
                await Rental.create({ UserId: user.id, BicycleId }, { transaction: t })
                await Bicycles.update({ status: false }, { where: { id: BicycleId } }, { transaction: t })
                await t.commit()

                return 'Rent start'
            } catch (err) {
                t.rollback()
                console.log(err);
                throw err
            }
        },
        doneRental: async (_, args, context) => {
            const t = await sequelize.transaction()
            try {
                const { rentalId, StationId, travelledDistance, totalPrice, transaction } = args
                const { user, error } = await context
                if (!user) { throw new AuthenticationError(error.message); }

                const rental = await Rental.findByPk(rentalId)
                if (transaction === "Cash") {
                    await Rental.update({ status: true, travelledDistance, totalPrice, transaction }, { where: { id: rentalId } }, { transaction: t })
                    await Bicycles.update({ status: true, StationId }, { where: { id: rental.BicycleId } }, { transaction: t })
                    await t.commit()
                    return 'Rent done'
                }
                const newBalance = user.balance - totalPrice
                await Rental.update({ status: true, travelledDistance, totalPrice, transaction }, { where: { id: rentalId } }, { transaction: t })
                await Bicycles.update({ status: true, StationId }, { where: { id: rental.BicycleId } }, { transaction: t })
                await Transaction.create({ action: 'Payment', amount: totalPrice, UserId: user.id }, { transaction: t })
                await User.update({ balance: newBalance }, { where: { id: user.id } }, { transaction: t })
                await t.commit()

                return 'Rent done'
            } catch (err) {
                t.rollback()
                console.log(err);
                throw err
            }
        },
        login: async (_, args) => {
            try {
                const { username, password } = args
                const user = await User.findOne({ where: { username } })
                if (!user) throw 'invalid username\password'
                const verifyPassword = bcrypt.compareSync(password, user.password)
                if (!verifyPassword) throw 'invalid username\password'
                const access_token = signToken(user)
                return access_token
            } catch (err) {
                console.log(err);
                throw err
            }
        },
        generateMidtranToken: async (_, args, context) => {
            try {
                const { amount } = args
                const { user, error } = context
                if (!user) { throw new AuthenticationError(error.message); }
                const midtransToken = await generateMidtransToken(user, amount)


                console.log(midtransToken);
                return midtransToken
            } catch (err) {
                console.log(err);
            }
        },
        topUpBalance: async (_, args, context) => {
            const t = await sequelize.transaction()
            try {
                const { amount } = args
                const { user, error } = context
                if (!user) { throw new AuthenticationError(error.message); }
                const verifyUser = await User.findByPk(user.id, { transaction: t })
                const newBalance = (verifyUser.balance || 0) + amount
                await User.update({ balance: newBalance }, { where: { id: user.id } }, { transaction: t })
                await Transaction.create({ action: 'Deposit', amount, UserId: user.id }, { transaction: t })
                await t.commit()
                return `success top up with amount ${amount}`
            } catch (err) {
                t.rollback()
                console.log(err);
                throw err
            }
        }
    }
}

module.exports = [typeDefs, resolvers];
