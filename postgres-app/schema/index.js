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
    latitude: String
    longtitude: String
    Bicycles: [Bicycles]
    createdAt: String
    upatedAt: String
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
    upatedAt: String
}

type Users {
    id: Int
    username: String
    role: String
    email: String
    password: String 
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
    upatedAt: String
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
}

type Mutation {
    addStation(
        name: String!
        address: String!
        latitude: String!
        longtitude: String!
    ): String
    
    addBicycle(
        name: String!
        feature: String!
        imageURL: String!
        description: String!
        price: Int!
       StationId: Int!
    ): String

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
                const { name, address, latitude, longtitude } = args
                await Station.create({ name, address, latitude, longtitude })
                return 'Station created'
            } catch (err) {
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
                await Transaction.create({action: 'Payment', amount: totalPrice, UserId: user.id}, { transaction: t })
                await User.update({balance: newBalance}, {where: {id: user.id}}, { transaction: t })
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
                if (!user) return 'invalid username\password'
                const verifyPassword = bcrypt.compareSync(password, user.password)
                if (!verifyPassword) return 'invalid username\password'
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

module.exports = [typeDefs, resolvers]