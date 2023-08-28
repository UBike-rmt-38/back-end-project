const { createApolloServer } = require("../app");
const { sequelize } = require('../models')
const jwt = require('jsonwebtoken')
const request = require("supertest");
const { hashSync } = require('bcrypt')

const { User } = require('../models')
const user = require('../data/users.json')
const stations = require('../data/station.json')
const bicycles = require('../data/bicycles.json')
const rentals = require('../data/rentals.json')
const categories = require('../data/categories.json')

user.forEach((e) => {
  e.createdAt = new Date()
  e.updatedAt = new Date()
  e.password = hashSync(e.password, 10)
})

stations.forEach((e) => {
  e.createdAt = new Date()
  e.updatedAt = new Date()
})

bicycles.forEach((e) => {
  e.createdAt = new Date()
  e.updatedAt = new Date()
})

rentals.forEach((e) => {
  e.createdAt = new Date()
  e.updatedAt = new Date()
})

categories.forEach((e) => {
  e.createdAt = new Date()
  e.updatedAt = new Date()
})

// < ----- User Endpoints ----- >
const createUsers = {
  query: `mutation CreateUser($username: String!, $email: String!, $password: String!) {
    createUser(username: $username, email: $email, password: $password)
  }`
}

const logins = {
  query: `mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password)
  }`
}

const getUserGeneral = {
  query: `query GetUsers {
    getUsers {
      id
      username
      role
      email
      password
      balance
    }
  }`
}

const getUserDetails = {
  query: `query GetUsersDetails {
    getUsersDetails {
      id
      username
      email
      role
      password
      balance
      Rentals {
        id
        status
        travelledDistance
        totalPrice
        UserId
        BicycleId
        transaction
      }
      Transactions {
        id
        action
        amount
        UserId
      }
    }
  }`
}


// < ----- Station Endpoints ----- >
const createStations = {
  query: `mutation AddStation($name: String!, $address: String!, $latitude: Float!, $longitude: Float!) {
    addStation(name: $name, address: $address, latitude: $latitude, longitude: $longitude)
  }`
}

const editStations = {
  query: `mutation EditStation($stationId: Int!, $name: String!, $address: String!, $latitude: Float!, $longitude: Float!) {
    editStation(stationId: $stationId, name: $name, address: $address, latitude: $latitude, longitude: $longitude)
  }`
}

const deleteStations = {
  query: `mutation DeleteStation($stationId: Int!) {
    deleteStation(stationId: $stationId)
  }`
}

const getStationsGeneral = {
  query: `query GetStations {
    getStations {
      id
      name
      address
      latitude
      longitude
      Bicycles {
        id
        name
        feature
        imageURL
        description
        price
        StationId
        status
        CategoryId
        updatedAt
        createdAt
      }
      createdAt
      updatedAt
    }
  }`
}

const getStationDetails = {
  query: `query GetStationsById($stationId: Int) {
    getStationsById(stationId: $stationId) {
      id
      name
      address
      latitude
      longitude
      Bicycles {
        id
        name
        feature
        imageURL
        description
        price
        StationId
        CategoryId
        status
      }
    }
  }`
}

const getStationBicycleQr = {
  query: `query GetStationQrCode {
    getStationQrCode {
      qrCode
      name
      bicycleQrcode {
        qrCode
        name
      }
    }
  }`
}

// < ----- Category Endpoints ----- >
const addCategories = {
  query: `mutation AddCategory($name: String!, $description: String!) {
    addCategory(name: $name, description: $description)
  }`
}

const editCategories = {
  query: `mutation AddCategory($name: String!, $description: String!, $categoryId: Int!) {
    editCategory(name: $name, description: $description, categoryId: $categoryId)
  }`
}

const deleteCategories = {
  query: `mutation DeleteCategory($categoryId: Int!) {
    deleteCategory(categoryId: $categoryId)
  }`
}

const getCategoriesGeneral = {
  query: `query GetCategories {
    getCategories {
      id
      name
      description
      Bicycles {
        id
        name
        feature
        imageURL
        description
        price
        StationId
        CategoryId
        status
      }
    }
  }`
}

const getCategoryDetail = {
  query: `query GetCategoriesById($categoryId: Int) {
    getCategoriesById(categoryId: $categoryId) {
      id
      name
      description
      Bicycles {
        id
        name
        feature
        imageURL
        description
        StationId
        price
        CategoryId
        status
      }
    }
  }`
}

// < ----- Bicycle Endpoints ----- >
const createBicycles = {
  query: `mutation AddBicycle($name: String!, $feature: String!, $imageUrl: String!, $description: String!, $price: Int!, $stationId: Int!, $categoryId: Int!) {
    addBicycle(name: $name, feature: $feature, imageURL: $imageUrl, description: $description, price: $price, StationId: $stationId, CategoryId: $categoryId)
  }`
}

const editBicycles = {
  query: `mutation AddBicycle($bicycleId: Int!, $name: String!, $feature: String!, $imageUrl: String!, $description: String!, $price: Int!, $stationId: Int!, $categoryId: Int!) {
    editBicycle(bicycleId: $bicycleId, name: $name, feature: $feature, imageURL: $imageUrl, description: $description, price: $price, StationId: $stationId, CategoryId: $categoryId)
  }`
}

const deleteBicycles = {
  query: `mutation DeleteBicycle($bicycleId: Int!) {
    deleteBicycle(bicycleId: $bicycleId)
  }`
}

const getBicycleGeneral = {
  query: `query GetBicycles {
    getBicycles {
      id
      name
      feature
      imageURL
      description
      price
      StationId
      CategoryId
      status
    }
  }`
}


// < ----- Rental Endpoints ----- >
const createRentals = {
  query: `mutation CreateRental($bicycleId: Int!) {
    createRental(BicycleId: $bicycleId)
  }`
}

const doneRentals = {
  query: `mutation DoneRental($travelledDistance: Int!, $totalPrice: Int!, $rentalId: Int!, $stationId: Int!, $transaction: String!) {
    doneRental(travelledDistance: $travelledDistance, totalPrice: $totalPrice, rentalId: $rentalId, StationId: $stationId, transaction: $transaction)
  }`
}

const getRentalsGeneral = {
  query: `query GetRentals {
    getRentals {
      id
      status
      travelledDistance
      totalPrice
      UserId
      BicycleId
      transaction
    }
  }`
}

// < ----- Payment Endpoints ----- >
const generateMidTokens = {
  query: `mutation GenerateMidtranToken($amount: Int) {
    generateMidtranToken(amount: $amount) {
      token
      redirect_url
    }
  }`
}

const topUpBalances = {
  query: `mutation TopUpBalance($amount: Int!) {
    topUpBalance(amount: $amount)
  }`
}

const getTransactionsGeneral = {
  query: `query GetTransactions {
    getTransactions {
      id
      action
      amount
      UserId
      User {
        id
        username
        role
        email
      }
    }
  }`
}

const getHistoryTransactionsGeneral = {
  query: `query UserHistoryTransaction($userId: Int) {
    userHistoryTransaction(UserId: $userId) {
      id
      action
      amount
      UserId
      User {
        id
        username
        role
        email
        password
        balance
      }
    }
  }`
}

let server, url;

beforeAll(async () => {
  await sequelize.queryInterface.bulkInsert("Users", user, {})
  await sequelize.queryInterface.bulkInsert("Stations", stations, {})
  await sequelize.queryInterface.bulkInsert("Categories", categories, {})
  await sequelize.queryInterface.bulkInsert("Bicycles", bicycles, {})
  await sequelize.queryInterface.bulkInsert("Rentals", rentals, {})
  const { server: apolloServer, url: serverUrl } = await createApolloServer({
    port: 0,
  });
  server = apolloServer;
  url = serverUrl;
});

afterAll(async () => {
  await sequelize.queryInterface.bulkDelete("Users", null, {
    restartIdentity: true,
    cascade: true,
    truncate: true,
  })
  await sequelize.queryInterface.bulkDelete("Categories", null, {
    restartIdentity: true,
    cascade: true,
    truncate: true,
  })
  await sequelize.queryInterface.bulkDelete("Stations", null, {
    restartIdentity: true,
    cascade: true,
    truncate: true,
  })
  await sequelize.queryInterface.bulkDelete("Bicycles", null, {
    restartIdentity: true,
    cascade: true,
    truncate: true,
  })
  await sequelize.queryInterface.bulkDelete("Rentals", null, {
    restartIdentity: true,
    cascade: true,
    truncate: true,
  })
  await server?.stop();
  // await sequelize.close()
});

describe.only("GraphQL Test Coverage", () => {

  // < -----              Mutation Test                ----- > 

  describe('Mutation Test Endpoints', () => {

    // > > > > ========       User Endpoints Test      ======== < < < <

    describe('+ createUser', () => {
      test('success create and return 200', async () => {
        const bodyData = {
          username: 'test',
          email: 'test@mail.com',
          password: 'tests'
        }

        const response = await request(url).post("/").send({
          query: createUsers.query,
          variables: bodyData
        });

        const { createUser } = response.body.data

        expect(response.status).toBe(200);
        expect(response.errors).toBeUndefined();
        expect(createUser).toEqual("User created");
      })

      test('failed create and return 200', async () => {
        const bodyData = {
          username: 'test',
          email: 'test@mail.com',
          password: ''
        }
        const response = await request(url).post("/").send({
          query: createUsers.query,
          variables: bodyData
        });

        expect(response.status).toBe(200);
        expect(response.errors).toBeUndefined()
        const { createUser } = response.body.data
        expect(createUser).toEqual(null);
      })


    })

    describe('+ login', () => {
      test('success login and return 200', async () => {
        const bodyData = {
          username: 'user1',
          password: 'user123'
        }
        const response = await request(url).post("/").send({
          query: logins.query,
          variables: bodyData
        });

        expect(response.status).toBe(200);
        expect(response.errors).toBeUndefined();
        const { login } = response.body.data
        expect(login).toEqual(expect.any(String));
      })

      test('failed login and return 200', async () => {
        const bodyData = {
          username: 'user1',
          password: ''
        }
        const response = await request(url).post("/").send({
          query: logins.query,
          variables: bodyData
        });

        expect(response.status).toBe(200);
        expect(response.errors).toBeUndefined();
        const { login } = response.body.data
        expect(login).toEqual("invalid usernamepassword");
      })
    })



    // > > > > ========       Station Endpoints Test        ======== < < < <

    describe('+ addStation', () => {
      test('success add and return 200', async () => {
        const bodyData = {
          name: "test",
          address: "test",
          latitude: 0.1222222,
          longitude: 8.9999
        }

        const { dataValues } = await User.findOne({ where: { username: 'admin' } })

        const response = await request(url).post("/")
          .send({
            query: createStations.query,
            variables: bodyData,
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));

        const { addStation } = response.body.data

        expect(response.status).toBe(200);
        expect(response.errors).toBeUndefined();
        expect(addStation).toEqual("Station created");
      })

      test('failed add and return 200', async () => {
        const bodyData = {
          name: "test",
          address: "",
          latitude: 0.1222222,
          longitude: 8.9999
        }

        const { dataValues } = await User.findOne({ where: { username: 'admin' } })

        const response = await request(url)
          .post("/")
          .send({
            query: createStations.query,
            variables: bodyData,
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));

        expect(response.status).toBe(200);
        expect(response.errors).toBeUndefined();
        const { addStation } = response.body.data
        expect(addStation).toEqual(null);
      })
    })

    describe('+ editStation', () => {
      test('success edit and return 200', async () => {
        const bodyData = {
          name: "testing",
          address: "test",
          latitude: 0.1222222,
          longitude: 8.9999,
          stationId: 3
        }

        const { dataValues } = await User.findOne({ where: { username: 'admin' } })

        const response = await request(url).post("/")
          .send({
            query: editStations.query,
            variables: bodyData,
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));

        const { editStation } = response.body.data

        expect(response.status).toBe(200);
        expect(response.errors).toBeUndefined();
        expect(editStation).toEqual(expect.any(String));
      })

      test('failed add and return 200', async () => {
        const bodyData = {
          name: "test",
          address: "",
          latitude: 0.1222222,
          longitude: 8.9999,
          stationId: 3
        }

        const { dataValues } = await User.findOne({ where: { username: 'admin' } })

        const response = await request(url)
          .post("/")
          .send({
            query: editStations.query,
            variables: bodyData,
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));

        expect(response.status).toBe(200);
        expect(response.errors).toBeUndefined();
        const { editStation } = response.body.data
        expect(editStation).toEqual(null);
      })
    })

    describe('+ deleteStation', () => {
      test('success delete and return 200', async () => {
        const bodyData = {
          stationId: 3
        }

        const { dataValues } = await User.findOne({ where: { username: 'admin' } })

        const response = await request(url).post("/")
          .send({
            query: deleteStations.query,
            variables: bodyData,
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));

        const { deleteStation } = response.body.data

        expect(response.status).toBe(200);
        expect(response.errors).toBeUndefined();
        expect(deleteStation).toEqual(expect.any(String));
      })

      test('failed delete and return 200', async () => {
        const bodyData = {}

        const { dataValues } = await User.findOne({ where: { username: 'admin' } })

        const response = await request(url)
          .post("/")
          .send({
            query: deleteStations.query,
            variables: bodyData,
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));

        expect(response.status).toBe(200);
        expect(response.errors).toBeUndefined();
      })
    })



    // > > > > ========     Category Endpoints Test       ========  < < < <

    describe('+ addCategory', () => {
      test('success add and return 200', async () => {
        const bodyData = {
          name: "test",
          description: "testing"
        }

        const { dataValues } = await User.findOne({ where: { username: 'admin' } })

        const response = await request(url).post("/")
          .send({
            query: addCategories.query,
            variables: bodyData,
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));

        const { addCategory } = response.body.data

        expect(response.status).toBe(200);
        expect(response.errors).toBeUndefined();
        expect(addCategory).toEqual("Category created");
      })

      test('failed add and return 200', async () => {
        const bodyData = {
          name: "test",
          description: ""
        }

        const { dataValues } = await User.findOne({ where: { username: 'admin' } })

        const response = await request(url).post("/")
          .send({
            query: addCategories.query,
            variables: bodyData,
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));


        expect(response.status).toBe(200);
        expect(response.errors).toBeUndefined();
        const { addCategory } = response.body.data
        expect(addCategory).toEqual(null);
      })
    })

    describe('+ editCategory', () => {
      test('success add and return 200', async () => {
        const bodyData = {
          "name": "testing",
          "description": "test",
          "categoryId": 4
        }

        const { dataValues } = await User.findOne({ where: { username: 'admin' } })

        const response = await request(url).post("/")
          .send({
            query: editCategories.query,
            variables: bodyData,
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));

        const { editCategory } = response.body.data

        expect(response.status).toBe(200);
        expect(response.errors).toBeUndefined();
        expect(editCategory).toEqual(expect.any(String));
      })

      test('failed add and return 200', async () => {
        const bodyData = {
          name: "test",
          description: "",
          "categoryId": 4
        }

        const { dataValues } = await User.findOne({ where: { username: 'admin' } })

        const response = await request(url).post("/")
          .send({
            query: editCategories.query,
            variables: bodyData,
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));


        expect(response.status).toBe(200);
        expect(response.errors).toBeUndefined();
        const { editCategory } = response.body.data
        expect(editCategory).toEqual(null);
      })
    })

    describe('+ deleteCategory', () => {
      test('success delete and return 200', async () => {
        const bodyData = {
          categoryId: 4
        }

        const { dataValues } = await User.findOne({ where: { username: 'admin' } })

        const response = await request(url).post("/")
          .send({
            query: deleteCategories.query,
            variables: bodyData,
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));

        const { deleteCategory } = response.body.data

        expect(response.status).toBe(200);
        expect(response.errors).toBeUndefined();
        expect(deleteCategory).toEqual(expect.any(String));
      })

      test('failed delete and return 200', async () => {
        const bodyData = {}

        const { dataValues } = await User.findOne({ where: { username: 'admin' } })

        const response = await request(url)
          .post("/")
          .send({
            query: deleteCategories.query,
            variables: bodyData,
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));

        expect(response.status).toBe(200);
        expect(response.errors).toBeUndefined();
      })
    })



    // > > > > ========     Bicycle Endpoints Test      ======== < < < <

    describe('+ addBicycle', () => {
      test('success add and return 200', async () => {
        const bodyData = {
          name: "test",
          feature: "test",
          imageUrl: "test",
          description: "test",
          price: 8000,
          stationId: 1,
          categoryId: 1
        }

        const { dataValues } = await User.findOne({ where: { username: 'admin' } })

        const response = await request(url)
          .post("/")
          .send({
            query: createBicycles.query,
            variables: bodyData
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));


        const { addBicycle } = response.body.data

        expect(response.status).toBe(200);
        expect(addBicycle).toEqual("Bicycle created");
      })

      test('failed add and return 200', async () => {

        const { dataValues } = await User.findOne({ where: { username: 'admin' } })

        const response = await request(url)
          .post("/")
          .send({
            query: createBicycles.query,
            variables: {}
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));

        expect(response.status).toBe(200);
        expect(response.errors).toBeUndefined();
      })
    })

    describe('+ editBicycle', () => {
      test('success edit and return 200', async () => {
        const bodyData = {
          name: "testing",
          feature: "test",
          imageUrl: "test",
          description: "test",
          price: 8000,
          stationId: 1,
          categoryId: 1,
          bicycleId: 6
        }

        const { dataValues } = await User.findOne({ where: { username: 'admin' } })

        const response = await request(url)
          .post("/")
          .send({
            query: editBicycles.query,
            variables: bodyData
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));


        const { editBicycle } = response.body.data

        expect(response.status).toBe(200);
        expect(editBicycle).toEqual(expect.any(String));
      })

      test('failed edit and return 200', async () => {
        const bodyData = {
          name: "testing",
          feature: "",
          imageUrl: "test",
          description: "test",
          price: 8000,
          stationId: 1,
          categoryId: 1,
          bicycleId: 6
        }

        const { dataValues } = await User.findOne({ where: { username: 'admin' } })

        const response = await request(url)
          .post("/")
          .send({
            query: editBicycles.query,
            variables: bodyData
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));

        expect(response.status).toBe(200);
        expect(response.errors).toBeUndefined();
        const { editBicycle } = response.body.data
        expect(editBicycle).toEqual(null);
      })
    })

    describe('+ deleteBicycle', () => {
      test('success delete and return 200', async () => {
        const bodyData = {
          bicycleId: 6
        }

        const { dataValues } = await User.findOne({ where: { username: 'admin' } })

        const response = await request(url).post("/")
          .send({
            query: deleteBicycles.query,
            variables: bodyData,
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));

        const { deleteBicycle } = response.body.data

        expect(response.status).toBe(200);
        expect(response.errors).toBeUndefined();
        expect(deleteBicycle).toEqual(expect.any(String));
      })

      test('failed delete and return 200', async () => {
        const bodyData = {}

        const { dataValues } = await User.findOne({ where: { username: 'admin' } })

        const response = await request(url)
          .post("/")
          .send({
            query: deleteBicycles.query,
            variables: bodyData,
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));

        expect(response.status).toBe(200);
        expect(response.errors).toBeUndefined();
      })
    })



    // > > > > ========     Rental Endpoints Test      ======== < < < <

    describe('+ createRental', () => {
      test('success create and return 200', async () => {
        const bodyData = {
          bicycleId: 1
        }

        const { dataValues } = await User.findOne({ where: { username: 'user1' } })

        const response = await request(url)
          .post("/")
          .send({
            query: createRentals.query,
            variables: bodyData
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));

        const { createRental } = response.body.data
        console.log(response.body);

        expect(response.status).toBe(200);
        expect(createRental).toEqual("Rent start");
      })

      test('failed create and return 200', async () => {

        const { dataValues } = await User.findOne({ where: { username: 'user1' } })

        const response = await request(url)
          .post("/")
          .send({
            query: createRentals.query,
            variables: {}
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));

        expect(response.status).toBe(200);
        expect(response.errors).toBeUndefined();
      })
    })

    describe('+ doneRental', () => {
      test('success done and return 200', async () => {
        const bodyData = {
          travelledDistance: 1000000,
          totalPrice: 120000,
          rentalId: 1,
          stationId: 1,
          transaction: "Digital"
        }

        const { dataValues } = await User.findOne({ where: { username: 'user1' } })

        const response = await request(url)
          .post("/")
          .send({
            query: doneRentals.query,
            variables: bodyData
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));

        const { doneRental } = response.body.data
        console.log(response.body);

        expect(response.status).toBe(200);
        expect(doneRental).toEqual("Rent done");
      })

      test('failed done and return 200', async () => {
        const bodyData = {
          travelledDistance: 1000000,
          totalPrice: 120000,
          rentalId: 1,
          stationId: 3,
        }

        const { dataValues } = await User.findOne({ where: { username: 'user1' } })

        const response = await request(url)
          .post("/")
          .send({
            query: doneRentals.query,
            variables: {}
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));

        expect(response.status).toBe(200);
        expect(response.errors).toBeUndefined();
      })
    })



    // > > > > ========     Payment Endpoints Test      ======== < < < <

    describe('+ generateMidtranToken', () => {
      test('success generate and return 200', async () => {
        const bodyData = {
          "amount": 10000,
        }

        const { dataValues } = await User.findOne({ where: { username: 'user1' } })

        const response = await request(url)
          .post("/")
          .send({
            query: generateMidTokens.query,
            variables: bodyData
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));

        const { generateMidtranToken } = response.body.data

        expect(response.status).toBe(200)
        expect(generateMidtranToken).toHaveProperty("token", expect.any(String))
        expect(generateMidtranToken).toHaveProperty("redirect_url", expect.any(String))
      })

      test('failed top up and return 200', async () => {
        const bodyData = {}

        const { dataValues } = await User.findOne({ where: { username: 'user1' } })

        const response = await request(url)
          .post("/")
          .send({
            query: generateMidTokens.query,
            variables: bodyData
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));

        expect(response.status).toBe(200);
        expect(response.errors).toBeUndefined();
      })
    })

    describe('+ topUpBalance', () => {
      test('success top up and return 200', async () => {
        const bodyData = {
          "amount": 10000,
        }

        const { dataValues } = await User.findOne({ where: { username: 'user1' } })

        const response = await request(url)
          .post("/")
          .send({
            query: topUpBalances.query,
            variables: bodyData
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));

        const { topUpBalance } = response.body.data

        expect(response.status).toBe(200)
        expect(topUpBalance).toEqual(expect.any(String))
      })

      test('failed top up and return 200', async () => {
        const bodyData = {}

        const { dataValues } = await User.findOne({ where: { username: 'user1' } })

        const response = await request(url)
          .post("/")
          .send({
            query: topUpBalances.query,
            variables: bodyData
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));

        expect(response.status).toBe(200);
        expect(response.errors).toBeUndefined();
      })
    })

  })

  // < -----            Query Test            ----- >
  describe('Query Test Endpoints', () => {
    describe("+ getUsers", () => {
      test("success return object and return 200", async () => {
        const { dataValues } = await User.findOne({ where: { username: 'admin' } })

        const response = await request(url)
          .post("/")
          .send(getUserGeneral)
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));


        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.errors).toBeUndefined();

        const { getUsers } = response.body.data

        if (getUsers.length > 0) {
          expect(getUsers[0]).toHaveProperty("id", expect.any(Number));
          expect(getUsers[0]).toHaveProperty("username", expect.any(String));
          expect(getUsers[0]).toHaveProperty("role", expect.any(String));
          expect(getUsers[0]).toHaveProperty("email", expect.any(String));
          expect(getUsers[0]).toHaveProperty("balance", expect.any(Number));

        }
      });
    });

    describe("+ getUsersDetails", () => {
      test("success return object and return 200", async () => {
        const { dataValues } = await User.findOne({ where: { username: 'user1' } })

        const response = await request(url)
          .post("/")
          .send(getUserDetails)
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));


        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.errors).toBeUndefined();

        const { getUsersDetails } = response.body.data

        if (getUsersDetails.length > 0) {
          expect(getUsersDetails[0]).toHaveProperty("id", expect.any(Number));
          expect(getUsersDetails[0]).toHaveProperty("username", expect.any(String));
          expect(getUsersDetails[0]).toHaveProperty("role", expect.any(String));
          expect(getUsersDetails[0]).toHaveProperty("email", expect.any(String));
          expect(getUsersDetails[0]).toHaveProperty("balance", expect.any(Number));

          if (getUserDetails[0].Rentals.length > 0) {
            const rentals = getUserDetails[0].Rentals[0]

            expect(rentals).toHaveProperty("id", expect.any(Number));
            expect(rentals).toHaveProperty("status", expect.any(Boolean));
            expect(rentals).toHaveProperty("travelledDistance", expect.any(Number));
            expect(rentals).toHaveProperty("totalPrice", expect.any(Number));
            expect(rentals).toHaveProperty("UserId", expect.any(Number));
            expect(rentals).toHaveProperty("BicycleId", expect.any(Number));
            expect(rentals).toHaveProperty("transaction", expect.any(String));
          }

          if (getUserDetails[0].Transactions.length > 0) {
            const transactions = getUserDetails[0].Transactions[0]

            expect(transactions).toHaveProperty("id", expect.any(Number));
            expect(transactions).toHaveProperty("action", expect.any(String));
            expect(transactions).toHaveProperty("amount", expect.any(Number));
            expect(transactions).toHaveProperty("UserId", expect.any(Number));
          }
        }
      });
    });

    describe("+ getStations", () => {
      test("success return object and return 200", async () => {
        const { dataValues } = await User.findOne({ where: { username: 'user1' } })

        const response = await request(url)
          .post("/")
          .send(getStationsGeneral)
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));


        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.errors).toBeUndefined();

        const { getStations } = response.body.data

        if (getStations.length > 0) {
          expect(getStations[0]).toHaveProperty("id", expect.any(Number));
          expect(getStations[0]).toHaveProperty("name", expect.any(String));
          expect(getStations[0]).toHaveProperty("address", expect.any(String));
          expect(typeof getStations[0].latitude).toBe('number');
          expect(Number.isFinite(getStations[0].latitude)).toBe(true);
          expect(typeof getStations[0].longitude).toBe('number');
          expect(Number.isFinite(getStations[0].longitude)).toBe(true);
          expect(getStations[0]).toHaveProperty("createdAt", expect.any(String));
          expect(getStations[0]).toHaveProperty("updatedAt", expect.any(String));

          if (getStations[0].Bicycles.length > 0) {
            const bicycles = getStations[0].Bicycles[0]

            expect(bicycles).toHaveProperty("id", expect.any(Number));
            expect(bicycles).toHaveProperty("name", expect.any(String));
            expect(bicycles).toHaveProperty("feature", expect.any(String));
            expect(bicycles).toHaveProperty("imageURL", expect.any(String));
            expect(bicycles).toHaveProperty("description", expect.any(String));
            expect(bicycles).toHaveProperty("price", expect.any(Number));
            expect(bicycles).toHaveProperty("StationId", expect.any(Number));
            expect(bicycles).toHaveProperty("CategoryId", expect.any(Number));
            expect(bicycles).toHaveProperty("status", expect.any(Boolean));
          }
        }
      });
    });


    describe("+ getStationsById", () => {
      test("success return object and return 200", async () => {
        const bodyData = {
          stationId: 1
        }
        const { dataValues } = await User.findOne({ where: { username: 'user1' } })

        const response = await request(url)
          .post("/")
          .send({
            query: getStationDetails.query,
            variables: bodyData
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));


        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.errors).toBeUndefined();

        const { getStationsById } = response.body.data

        expect(getStationsById).toHaveProperty("id", expect.any(Number));
        expect(getStationsById).toHaveProperty("name", expect.any(String));
        expect(getStationsById).toHaveProperty("address", expect.any(String));
        expect(typeof getStationsById.latitude).toBe('number');
        expect(Number.isFinite(getStationsById.latitude)).toBe(true);
        expect(typeof getStationsById.longitude).toBe('number');
        expect(Number.isFinite(getStationsById.longitude)).toBe(true);

        if (getStationsById.Bicycles.length > 0) {
          const bicycles = getStationsById.Bicycles[0]

          expect(bicycles).toHaveProperty("id", expect.any(Number));
          expect(bicycles).toHaveProperty("name", expect.any(String));
          expect(bicycles).toHaveProperty("feature", expect.any(String));
          expect(bicycles).toHaveProperty("imageURL", expect.any(String));
          expect(bicycles).toHaveProperty("description", expect.any(String));
          expect(bicycles).toHaveProperty("price", expect.any(Number));
          expect(bicycles).toHaveProperty("StationId", expect.any(Number));
          expect(bicycles).toHaveProperty("CategoryId", expect.any(Number));
          expect(bicycles).toHaveProperty("status", expect.any(Boolean));
        }
      });

      test("success return object and return 200", async () => {
        const bodyData = {}
        const { dataValues } = await User.findOne({ where: { username: 'user1' } })

        const response = await request(url)
          .post("/")
          .send({
            query: getStationDetails.query,
            variables: bodyData
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));


        expect(response.status).toBe(200);
        expect(response.errors).toBeUndefined();

        const { getStationsById } = response.body.data

        expect(getStationsById).toEqual(null)
      });
    });

    describe("+ getStationQrCode", () => {
      test("success return object and return 200", async () => {
        const { dataValues } = await User.findOne({ where: { username: 'user1' } })

        const response = await request(url)
          .post("/")
          .send(getStationBicycleQr)
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));


        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.errors).toBeUndefined();

        const { getStationQrCode } = response.body.data

        if (getStationQrCode.length > 0) {
          expect(getStationQrCode[0]).toHaveProperty("qrCode", expect.any(String));
          expect(getStationQrCode[0]).toHaveProperty("name", expect.any(String));

          if (getStationQrCode[0].bicycleQrcode.length > 0) {
            const bicycles = getStationQrCode[0].bicycleQrcode[0]

            expect(bicycles).toHaveProperty("qrCode", expect.any(String));
            expect(bicycles).toHaveProperty("name", expect.any(String));

          }
        }
      });
    });

    describe("+ getCategories", () => {
      test("success return object and return 200", async () => {
        const { dataValues } = await User.findOne({ where: { username: 'user1' } })

        const response = await request(url)
          .post("/")
          .send(getCategoriesGeneral)
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));


        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.errors).toBeUndefined();

        const { getCategories } = response.body.data

        if (getCategories.length > 0) {
          expect(getCategories[0]).toHaveProperty("id", expect.any(Number));
          expect(getCategories[0]).toHaveProperty("name", expect.any(String));
          expect(getCategories[0]).toHaveProperty("description", expect.any(String));

          if (getCategories[0].Bicycles.length > 0) {
            const bicycles = getCategories[0].Bicycles[0]

            expect(bicycles).toHaveProperty("id", expect.any(Number));
            expect(bicycles).toHaveProperty("name", expect.any(String));
            expect(bicycles).toHaveProperty("feature", expect.any(String));
            expect(bicycles).toHaveProperty("imageURL", expect.any(String));
            expect(bicycles).toHaveProperty("description", expect.any(String));
            expect(bicycles).toHaveProperty("price", expect.any(Number));
            expect(bicycles).toHaveProperty("StationId", expect.any(Number));
            expect(bicycles).toHaveProperty("CategoryId", expect.any(Number));
            expect(bicycles).toHaveProperty("status", expect.any(Boolean));
          }
        }
      });
    });

    describe("+ getCategoriesById", () => {
      test("success return object and return 200", async () => {
        const bodyData = {
          categoryId: 1
        }
        const { dataValues } = await User.findOne({ where: { username: 'user1' } })

        const response = await request(url)
          .post("/")
          .send({
            query: getCategoryDetail.query,
            variables: bodyData
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));


        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.errors).toBeUndefined();

        const { getCategoriesById } = response.body.data

        expect(getCategoriesById).toHaveProperty("id", expect.any(Number));
        expect(getCategoriesById).toHaveProperty("name", expect.any(String));
        expect(getCategoriesById).toHaveProperty("description", expect.any(String));

        if (getCategoriesById.Bicycles.length > 0) {
          const bicycles = getCategoriesById.Bicycles[0]

          expect(bicycles).toHaveProperty("id", expect.any(Number));
          expect(bicycles).toHaveProperty("name", expect.any(String));
          expect(bicycles).toHaveProperty("feature", expect.any(String));
          expect(bicycles).toHaveProperty("imageURL", expect.any(String));
          expect(bicycles).toHaveProperty("description", expect.any(String));
          expect(bicycles).toHaveProperty("price", expect.any(Number));
          expect(bicycles).toHaveProperty("StationId", expect.any(Number));
          expect(bicycles).toHaveProperty("CategoryId", expect.any(Number));
          expect(bicycles).toHaveProperty("status", expect.any(Boolean));
        }
      });

      test("success return object and return 200", async () => {
        const bodyData = {}
        const { dataValues } = await User.findOne({ where: { username: 'user1' } })

        const response = await request(url)
          .post("/")
          .send({
            query: getCategoryDetail.query,
            variables: bodyData
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));


        expect(response.status).toBe(200);
        expect(response.errors).toBeUndefined();

        const { getCategoriesById } = response.body.data

        expect(getCategoriesById).toEqual(null)
      });
    });

    describe("+ getBicycles", () => {
      test("success return object and return 200", async () => {
        const { dataValues } = await User.findOne({ where: { username: 'user1' } })

        const response = await request(url)
          .post("/")
          .send(getBicycleGeneral)
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));


        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.errors).toBeUndefined();

        const { getBicycles } = response.body.data

        if (getBicycles.length > 0) {
          expect(getBicycles[0]).toHaveProperty("id", expect.any(Number));
          expect(getBicycles[0]).toHaveProperty("name", expect.any(String));
          expect(getBicycles[0]).toHaveProperty("feature", expect.any(String));
          expect(getBicycles[0]).toHaveProperty("imageURL", expect.any(String));
          expect(getBicycles[0]).toHaveProperty("description", expect.any(String));
          expect(getBicycles[0]).toHaveProperty("price", expect.any(Number));
          expect(getBicycles[0]).toHaveProperty("StationId", expect.any(Number));
          expect(getBicycles[0]).toHaveProperty("CategoryId", expect.any(Number));
          expect(getBicycles[0]).toHaveProperty("status", expect.any(Boolean));
        }
      });
    });

    describe('+ getRentals', () => {
      test('success return object and return 200', async () => {
        const { dataValues } = await User.findOne({ where: { username: 'user1' } })

        const response = await request(url)
          .post("/")
          .send(getRentalsGeneral)
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));

        expect(response.status).toBe(200);
        expect(response.errors).toBeUndefined();

        const { getRentals } = response.body.data

        if (getRentals.length > 0) {
          expect(getRentals[0]).toHaveProperty("id", expect.any(Number))
          expect(getRentals[0]).toHaveProperty("status", expect.any(Boolean))
          expect(getRentals[0]).toHaveProperty("travelledDistance", expect.any(Number))
          expect(getRentals[0]).toHaveProperty("totalPrice", expect.any(Number))
          expect(getRentals[0]).toHaveProperty("UserId", expect.any(Number))
          expect(getRentals[0]).toHaveProperty("BicycleId", expect.any(Number))
          expect(getRentals[0]).toHaveProperty("transaction", expect.any(String))
        }
      })
    })

    describe("+ getTransactions", () => {
      test("success return object and return 200", async () => {
        const { dataValues } = await User.findOne({ where: { username: 'admin' } })

        const response = await request(url)
          .post("/")
          .send(getTransactionsGeneral)
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));


        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.errors).toBeUndefined();

        const { getTransactions } = response.body.data

        if (getTransactions.length > 0) {
          expect(getTransactions[0]).toHaveProperty("id", expect.any(Number));
          expect(getTransactions[0]).toHaveProperty("action", expect.any(String));
          expect(getTransactions[0]).toHaveProperty("amount", expect.any(Number));
          expect(getTransactions[0]).toHaveProperty("UserId", expect.any(Number));

          if (getTransactions[0].User.length > 0) {
            expect(getTransactions[0].User[0]).toHaveProperty("id", expect.any(Number));
            expect(getTransactions[0].User[0]).toHaveProperty("username", expect.any(String));
            expect(getTransactions[0].User[0]).toHaveProperty("role", expect.any(String));
            expect(getTransactions[0].User[0]).toHaveProperty("email", expect.any(String));
            expect(getTransactions[0].User[0]).toHaveProperty("balance", expect.any(Number));
          }
        }
      });
    });

    describe("+ userHistoryTransaction", () => {
      test("success return object and return 200", async () => {
        const bodyData = {
          userId: 1
        }
        const { dataValues } = await User.findOne({ where: { username: 'admin' } })

        const response = await request(url)
          .post("/")
          .send({
            query: getHistoryTransactionsGeneral.query,
            variables: bodyData
          })
          .set('Authorization', jwt.sign(dataValues, process.env.JWT_SECRET));


        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.errors).toBeUndefined();

        const { userHistoryTransaction } = response.body.data

        if (userHistoryTransaction.length > 0) {
          expect(userHistoryTransaction[0]).toHaveProperty("id", expect.any(Number));
          expect(userHistoryTransaction[0]).toHaveProperty("action", expect.any(String));
          expect(userHistoryTransaction[0]).toHaveProperty("amount", expect.any(Number));
          expect(userHistoryTransaction[0]).toHaveProperty("UserId", expect.any(Number));

          if (userHistoryTransaction[0].User.length > 0) {
            expect(userHistoryTransaction[0].User[0]).toHaveProperty("id", expect.any(Number));
            expect(userHistoryTransaction[0].User[0]).toHaveProperty("username", expect.any(String));
            expect(userHistoryTransaction[0].User[0]).toHaveProperty("role", expect.any(String));
            expect(userHistoryTransaction[0].User[0]).toHaveProperty("email", expect.any(String));
            expect(userHistoryTransaction[0].User[0]).toHaveProperty("balance", expect.any(Number));
          }
        }
      });
    });

  });
});
