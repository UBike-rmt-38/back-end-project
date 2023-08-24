"use strict";
const bcrypt = require('bcrypt')
const { User, Bicycles, Rental, Station, sequelize } = require('../models/index');
const { signToken } = require('../helpers/jwt');

const typeDefs = `#graphql
type Stations {
    id: Int 
    name: String
    address: String
    latitude: String
    longtitude: String
    Bicycles: [Bicycles]
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
        name: String
        address: String
        latitude: String
        longtitude: String
    ): String
    
    addBicycle(
        name: String
        feature: String
        imageURL: String
        description: String
        price: Int
       StationId: Int
       status: Boolean
    ): String

    createUser(
        username: String
        email: String
        password: String 
    ): String

    createRental(
        UserId: Int
        BicycleId: Int 
    ): String

    updateRental(
        rentalId: Int
        travelledDistance: Int
        totalPrice: Int 
        StationId: Int
    ): String

    login(
        username: String!
        password: String!
    ): String
}
`

const resolvers = {
    Query: {
        getStations: async () => {
            const data = await Station.findAll()
            return data
        },
        getBicycles: async () => {
            const data = await Bicycles.findAll()
            return data
        },
        getUsers: async () => {
            const data = await User.findAll()
            return data
        },
        getRentals: async () => {
            const data = await Rental.findAll()
            return data
        },
        getStationsById: async (_, args) => {
            try {
                const { stationId } = args
                const data = await Station.findByPk(stationId, {
                    include: {
                        model: Bicycles
                    }
                })
                console.log(data);
                return data
            } catch (err) {
                console.log(err);
            }
        }
    },
    Mutation: {
        addStation: async (_, args) => {
            try {
                const { name, address, latitude, longtitude } = args
                await Station.create({ name, address, latitude, longtitude })
                return 'Station created'
            } catch (err) {
                console.log(err);
            }
        },
        addBicycle: async (_, args) => {
            try {
                const { name, feature, imageURL, description, price, StationId } = args
                await Bicycles.create({ name, feature, imageURL, description, price, StationId })
                return 'Bicycle created'
            } catch (err) {
                console.log(err);
            }
        },
        createUser: async (_, args) => {
            try {
                const { username, email, password } = args
                await User.create({ username, role: 'User', email, password })
                return 'User created'
            } catch (err) {
                console.log(err);
            }
        },
        createRental: async (_, args) => {
            const t = await sequelize.transaction()
            try {
                const { UserId, BicycleId } = args
                await Rental.create({ travelledDistance: 0, totalPrice: 0, UserId, BicycleId }, { transaction: t })
                await Bicycles.update({ status: false }, { where: { id: BicycleId } }, { transaction: t })
                await t.commit()

                return 'Rent start'
            } catch (err) {
                t.rollback()
                console.log(err);
            }
        },
        updateRental: async (_, args) => {
            const t = await sequelize.transaction()
            try {
                const { rentalId, travelledDistance, totalPrice, StationId } = args
                await Rental.update({ status: false, travelledDistance, totalPrice }, { where: { id: rentalId } }, { transaction: t })
                const rental = await Rental.findByPk(rentalId)
                await Bicycles.update({ status: true, StationId }, { where: { id: rental.BicycleId } }, { transaction: t })
                await t.commit()

                return 'Rent done'
            } catch (err) {
                t.rollback()
                console.log(err);
            }
        },
        login: async (_,args) =>{
            try{
                const {username, password}= args
                const user = await User.findOne({where: {username}})
               if (!user) return 'invalid username\password'
               const verifyPassword = bcrypt.compareSync(password, user.password)
               if(!verifyPassword) return 'invalid username\password'
               const access_token = signToken(user)
               return access_token
            }catch(err){
                console.log(err);
            }
        }
    }
}

module.exports = [typeDefs, resolvers]