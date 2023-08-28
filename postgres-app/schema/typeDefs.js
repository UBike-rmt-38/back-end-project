const typeDefs = `#graphql
type Stations {
    id: Int 
    name: String
    address: String
    latitude: String
    longitude: String
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
    balance: Int
    Rentals: [Rentals]
    Transactions: [Transactions]
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

type stationQrcode {
    qrCode: String
    name: String
    bicycleQrcode: [bicycleQrcode]
}

type bicycleQrcode {
    qrCode: String
    name: String
}

type Query {
    getStations: [Stations]
    getBicycles: [Bicycles]
    getUsers: [Users]
    getUsersDetails: Users
    getRentals: [Rentals]
    getStationsById(stationId: Int): Stations
    getTransactions: [Transactions]
    userHistoryTransaction(UserId: Int): [Transactions]
    getStationQrCode: [stationQrcode]
    getRentalReport: [Rentals]
}

type Mutation {
    addStation(
        name: String!
        address: String!
        latitude: String!
        longitude: String!
    ): String
    
    editStation(
        stationId: Int!
        name: String!
        address: String!
        latitude: String!
        longitude: String!
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
module.exports = typeDefs