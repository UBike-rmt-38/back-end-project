"use strict";
const bcrypt = require('bcrypt')
const { User, Bicycles, Rental, Station, sequelize } = require('../models/index');
const { signToken } = require('../helpers/jwt');
const midtransClient = require('midtrans-client');

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
    transaction: String
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
        travelledDistance: Int
        totalPrice: Int 
        UserId: Int
        BicycleId: Int
        transaction: String
    ): String

    doneRental(
        rentalId: Int
        StationId: Int
    ): String

    login(
        username: String!
        password: String!
    ): String

    generateMidtrans(
        userId: Int
        totalPrice: Int
    ): MidtranToken
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
                const { travelledDistance, totalPrice, UserId, BicycleId, transaction } = args
                await Rental.create({ travelledDistance, totalPrice, UserId, BicycleId, transaction }, { transaction: t })
                await Bicycles.update({ status: false }, { where: { id: BicycleId } }, { transaction: t })
                await t.commit()

                return 'Rent start'
            } catch (err) {
                t.rollback()
                console.log(err);
            }
        },
        doneRental: async (_, args) => {
            const t = await sequelize.transaction()
            try {
                const { rentalId, StationId } = args
                await Rental.update({ status: true }, { where: { id: rentalId } }, { transaction: t })
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
        },
        generateMidtrans: async (_,args) =>{
            try{
                const {userId, totalPrice} = args
                const user = await User.findByPk(userId)
                let snap = new midtransClient.Snap({
                    isProduction: false,
                    serverKey: process.env.MIDTRANS_API_KEY
                });
    
                let parameter = {
                    transaction_details: {
                        order_id: "UBIKE" + Math.floor(1000000 + Math.random() * 9000000),
                        gross_amount: totalPrice
                    },
                    credit_card: {
                        secure: true
                    },
                    customer_details: {
                        username: user.username,
                        email: user.email
                    }
                };
                const midtransToken = await snap.createTransaction(parameter)
                console.log(midtransToken);
                return midtransToken
            } catch(err){
                console.log(err);
            }
        }
    }
}

module.exports = [typeDefs, resolvers]