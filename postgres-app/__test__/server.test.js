const { createApolloServer } = require("../app");
const { sequelize } = require('../models')
const request = require("supertest");
const { hashSync } = require('bcrypt')

const user = require('../data/users.json')
const station = require('../data/station.json')
const bicycles = require('../data/bicycles.json')
const rentals = require('../data/rentals.json')

user.forEach((e) => {
  e.createdAt = new Date()
  e.updatedAt = new Date()
  e.password = hashSync(e.password, 10)
})

station.forEach((e) => {
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

// getBicycles
const getBicycles = {
  query: `query GetBicycles {
    getBicycles {
      id
      name
      feature
      imageURL
      description
      price
      StationId
      status
    }
  }`,
};


const getStations = {
  query: `query GetStations {
    getStations {
      id
      name
      address
      latitude
      longitude
    }
  }`
}

const getStationsById = {
  query: `query GetStationsById($stationId: Int) {
    getStationsById(stationId: $stationId) {
      id
      name
      address
      latitude
      longtitude
      Bicycles {
        id
        name
        feature
        imageURL
        description
        price
        StationId
        status
      }
    }
  }`
}

const getUsers = {
  query: `query GetUsers {
    getUsers {
      id
      username
      role
      email
      password
    }
  }`
}

const getRentals = {
  query: `query GetRentals {
    getRentals {
      id
      status
      travelledDistance
      totalPrice
      UserId
      BicycleId
    }
  }`
}

const createUsers = {
  query: `mutation CreateUser($username: String, $email: String, $password: String) {
    createUser(username: $username, email: $email, password: $password)
  }`
}

const createStations = {
  query: `mutation AddStation($name: String, $address: String, $latitude: String, $longtitude: String) {
    addStation(name: $name, address: $address, latitude: $latitude, longtitude: $longtitude)
  }`
}

const createBicycles = {
  query: `mutation AddBicycle($name: String!, $feature: String!, $imageUrl: String!, $description: String!, $price: Int!, $stationId: Int!) {
    addBicycle(name: $name, feature: $feature, imageURL: $imageUrl, description: $description, price: $price, StationId: $stationId)
  }`
}

const createRent = {
  query: `mutation CreateRental($userId: Int, $bicycleId: Int) {
    createRental(UserId: $userId, BicycleId: $bicycleId)
  }`
}

const updateRent = {
  query: `mutation UpdateRental($rentalId: Int, $travelledDistance: Int, $totalPrice: Int, $stationId: Int) {
    updateRental(rentalId: $rentalId, travelledDistance: $travelledDistance, totalPrice: $totalPrice, StationId: $stationId)
  }`
}

let server, url;

beforeAll(async () => {
  await sequelize.queryInterface.bulkInsert("Users", user, {})
  await sequelize.queryInterface.bulkInsert("Stations", station, {})
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

describe("GraphQL Test Coverage", () => {

  // < ----- Mutation Test ----- > 
  describe('Mutation Test Endpoints', () => {
    // create new user
    describe('createUser', () => {
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
        expect(createUser).toEqual("User created");
      })

      test('failed create and return 200', async () => {

        const response = await request(url).post("/").send({
          query: createUsers.query,
          variables: {}
        });

        expect(response.status).toBe(200);
        const { createUser } = response.body.data
        expect(createUser).toEqual(null);
      })
    })

    // // add new station
    // describe('addStation', () => {
    //   test('success add and return 200', async () => {
    //     const bodyData = {
    //       name: "test",
    //       address: "test",
    //       latitude: "0.1222222",
    //       longtitude: "08.9999"
    //     }

    //     const response = await request(url).post("/").send({
    //       query: createStations.query,
    //       variables: bodyData
    //     });

    //     const { addStation } = response.body.data

    //     expect(response.status).toBe(200);
    //     expect(addStation).toEqual("Station created");
    //   })

    //   test('failed add and return 200', async () => {

    //     const response = await request(url).post("/").send({
    //       query: createStations.query,
    //       variables: {}
    //     });

    //     expect(response.status).toBe(200);
    //     const { addStation } = response.body.data
    //     expect(addStation).toEqual(null);
    //   })
    // })

    // // add new bicycle
    // describe('addBicycle', () => {
    //   test('success add and return 200', async () => {
    //     const bodyData = {
    //       name: "testing",
    //       feature: "testing",
    //       imageUrl: "testing",
    //       description: "test new",
    //       price: 120000,
    //       stationId: 1,  
    //     }

    //     const response = await request(url).post("/").send({
    //       query: createBicycles.query,
    //       variables: bodyData
    //     });

    //     const { addBicycle } = response.body.data

    //     expect(response.status).toBe(200);
    //     expect(addBicycle).toEqual("Bicycle created");
    //   })

    //   test('failed add and return 200', async () => {

    //     const response = await request(url).post("/").send({
    //       query: createBicycles.query,
    //       variables: {}
    //     });

    //     expect(response.status).toBe(200);
    //     expect(response.errors).toBeUndefined();
    //   })
    // })

    // // create rent
    // describe('createRental', () => {
    //   test('success create and return 200', async () => {
    //     const bodyData = {
    //       userId: 1,
    //       bicycleId: 1
    //     }

    //     const response = await request(url).post("/").send({
    //       query: createRent.query,
    //       variables: bodyData
    //     });

    //     const { createRental } = response.body.data

    //     expect(response.status).toBe(200);
    //     expect(createRental).toEqual("Rent start");
    //   })

    //   test('failed add and return 200', async () => {

    //     const response = await request(url).post("/").send({
    //       query: createRent.query,
    //       variables: {}
    //     });

    //     expect(response.status).toBe(200);
    //     const { createRental } = response.body.data
    //     expect(createRental).toEqual(null);
    //   })
    // })


    // // update rent
    // describe('updateRental', () => {
    //   test('success update and return 200', async () => {
    //     const bodyData = {
    //       rentalId: 1,
    //       travelledDistance: 123456,
    //       totalPrice: 200000,
    //       stationId: 1
    //     }

    //     const response = await request(url).post("/").send({
    //       query: updateRent.query,
    //       variables: bodyData
    //     });

    //     const { updateRental } = response.body.data

    //     expect(response.status).toBe(200);
    //     expect(updateRental).toEqual("Rent done");
    //   })

    //   test('failed update and return 200', async () => {

    //     const response = await request(url).post("/").send({
    //       query: updateRent.query,
    //       variables: {}
    //     });

    //     expect(response.status).toBe(200);
    //     const { updateRental } = response.body.data
    //     expect(updateRental).toEqual(null);
    //   })
    // })
  })

  // < ----- Query Test ----- >
  // describe('Query Test Endpoints', () => {
  //   // get all bicycles
  //   describe("getBicycles", () => {
  //     test("success return object and return 200", async () => {
  //       const response = await request(url)
  //         .post("/")
  //         .send(getBicycles);

  //       expect(response.status).toBe(200);
  //       expect(response.body).toBeInstanceOf(Object);
  //       expect(response.errors).toBeUndefined();

  //       const { data } = response.body

  //       if (data.getBicycles.length > 0) {
  //         expect(data.getBicycles[0]).toHaveProperty("id", expect.any(Number));
  //         expect(data.getBicycles[0]).toHaveProperty("name", expect.any(String));
  //         expect(data.getBicycles[0]).toHaveProperty("feature", expect.any(String));
  //         expect(data.getBicycles[0]).toHaveProperty("imageURL", expect.any(String));
  //         expect(data.getBicycles[0]).toHaveProperty("description", expect.any(String));
  //         expect(data.getBicycles[0]).toHaveProperty("price", expect.any(Number));
  //         expect(data.getBicycles[0]).toHaveProperty("StationId", expect.any(Number));
  //         expect(data.getBicycles[0]).toHaveProperty("status", expect.any(Boolean));
  //       }
  //     });
  //   });

  //   // get all stations
  //   describe("getStations", () => {
  //     test("success return of object and return 200", async () => {
  //       const response = await request(url)
  //         .post("/")
  //         .send(getStations);

  //       expect(response.status).toBe(200);
  //       expect(response.body).toBeInstanceOf(Object); // <=== body nya GraphQL itu property bername "data" yang mana itu Object, bukan Array
  //       expect(response.errors).toBeUndefined();

  //       const { data } = response.body

  //       if (data.getStations.length > 0) {
  //         expect(data.getStations[0]).toHaveProperty("id", expect.any(Number));
  //         expect(data.getStations[0]).toHaveProperty("name", expect.any(String));
  //         expect(data.getStations[0]).toHaveProperty("address", expect.any(String));
  //         expect(data.getStations[0]).toHaveProperty("latitude", expect.any(String));
  //         expect(data.getStations[0]).toHaveProperty("longtitude", expect.any(String));
  //       }
  //     });
  //   });

  //   // getStationById
  //   describe('getStationById', (done) => {
  //     test('success return object and return 200', async () => {
  //       const response = await request(url)
  //         .post("/")
  //         .send({
  //           query: getStationsById.query,
  //           variables: { stationId: 1 }
  //         })

  //       expect(response.status).toBe(200)
  //       expect(response.body).toBeInstanceOf(Object);
  //       expect(response.errors).toBeUndefined();

  //       const { data } = response.body

  //       expect(data.getStationsById).toHaveProperty("id", expect.any(Number));
  //       expect(data.getStationsById).toHaveProperty("name", expect.any(String));
  //       expect(data.getStationsById).toHaveProperty("address", expect.any(String));
  //       expect(data.getStationsById).toHaveProperty("latitude", expect.any(String));
  //       expect(data.getStationsById).toHaveProperty("longtitude", expect.any(String));

  //       const { Bicycles } = data.getStationsById
  //       expect(Bicycles).toBeInstanceOf(Array);

  //       if (Bicycles.length > 0) {
  //         const bicycle = Bicycles[0];

  //         expect(bicycle).toHaveProperty("id", expect.any(Number));
  //         expect(bicycle).toHaveProperty("name", expect.any(String));
  //         expect(bicycle).toHaveProperty("feature", expect.any(String));
  //         expect(bicycle).toHaveProperty("imageURL", expect.any(String));
  //         expect(bicycle).toHaveProperty("description", expect.any(String));
  //         expect(bicycle).toHaveProperty("price", expect.any(Number));
  //         expect(bicycle).toHaveProperty("StationId", expect.any(Number));
  //         expect(bicycle).toHaveProperty("status", expect.any(Boolean));
  //       }

  //     })
  //     test('data not found and return 200', async () => {
  //       const response = await request(url)
  //         .post("/")
  //         .send({
  //           query: getStationsById.query,
  //           variables: { stationId: 999 }
  //         });

  //       expect(response.status).toBe(200);
  //       const { data } = response.body

  //       expect(data.getStationsById).toEqual(null);
  //     })
  //   })

  //   // get all users
  //   describe("getUsers", () => {
  //     test("success return of object and return 200", async () => {
  //       const response = await request(url)
  //         .post("/")
  //         .send(getUsers);

  //       expect(response.status).toBe(200);
  //       expect(response.body).toBeInstanceOf(Object); // <=== body nya GraphQL itu property bername "data" yang mana itu Object, bukan Array
  //       expect(response.errors).toBeUndefined();

  //       const { data } = response.body

  //       if (data.getUsers.length > 0) {
  //         expect(data.getUsers[0]).toHaveProperty("id", expect.any(Number));
  //         expect(data.getUsers[0]).toHaveProperty("username", expect.any(String));
  //         expect(data.getUsers[0]).toHaveProperty("role", expect.any(String));
  //         expect(data.getUsers[0]).toHaveProperty("email", expect.any(String));
  //         expect(data.getUsers[0]).toHaveProperty("password", expect.any(String));
  //       }
  //     });
  //   });

  //   // get all rentals
  //   describe("getRentals", () => {
  //     test("success return of object and return 200", async () => {
  //       const response = await request(url)
  //         .post("/")
  //         .send(getRentals);

  //       expect(response.status).toBe(200);
  //       expect(response.body).toBeInstanceOf(Object); // <=== body nya GraphQL itu property bername "data" yang mana itu Object, bukan Array
  //       expect(response.errors).toBeUndefined();

  //       const { data } = response.body

  //       if (data.getRentals.length > 0) {
  //         expect(data.getRentals[0]).toHaveProperty("id", expect.any(Number));
  //         expect(data.getRentals[0]).toHaveProperty("status", expect.any(Boolean));
  //         expect(data.getRentals[0]).toHaveProperty("travelledDistance", expect.any(Number));
  //         expect(data.getRentals[0]).toHaveProperty("totalPrice", expect.any(Number));
  //         expect(data.getRentals[0]).toHaveProperty("UserId", expect.any(Number));
  //         expect(data.getRentals[0]).toHaveProperty("BicycleId", expect.any(Number));
  //       }
  //     });
  //   });
  // })
});
