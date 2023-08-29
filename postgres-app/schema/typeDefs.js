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

type Categories {
    id: Int
    name: String
    description: String
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
    CategoryId: Int
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
    getCategories: [Categories]
    getUsers: [Users]
    getUsersDetails: Users
    getRentals: [Rentals]
    getCategoriesById(categoryId: Int): Categories
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

    addCategory(
        name: String!
        description: String!
    ): String

    editCategory(
        name: String!
        description: String!
        categoryId: Int!
    ): String

    deleteCategory(categoryId: Int!): String

    addBicycle(
        name: String!
        feature: String!
        imageURL: String!
        description: String!
        price: Int!
       StationId: Int!
       CategoryId: Int!
    ): String

    editBicycle(
        bicycleId: Int!
        name: String!
        feature: String!
        imageURL: String!
        description: String!
        price: Int!
       StationId: Int!
       CategoryId: Int!
    ): String

    deleteBicycle(bicycleId: Int!): String

    createUser(
        username: String!
        email: String!
        password: String! 
        role: String
    ): String

    createRental(
        bicycleToken: String!
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

    changePassword(
        oldPassword: String!
        newPassword: String!
    ): String
}
`
module.exports = typeDefs