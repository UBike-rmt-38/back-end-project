const { createApolloServer } = require('../app');

const { request } = require('supertest');

// getBicycles
const getBicycles = {
  query: `query getBicycles {
    id
    name
    feature
    imageURL
    description
    price
    StationId
    status
  }`
};


describe('GraphQL Test Coverage', () => {
  let server, url;

  beforeAll(async () => {
    ({ server, url } = await createApolloServer({ port: 0 }));
  });

  afterAll(async () => {
    await server?.stop();
  });

  describe('getPost', () => {

    test('success return array of object and return 200', async () => {
      const respond = await request(url).post("/").send(getBicycles)

      expect(respond.status).toBe(200)
      expect(respond.body).toBeInstanceOf(Array);
      expect(respond.errors).toBeUndefined();

      if (respond.body.length > 0) {
        const bicycle = respond.body[0];

        expect(bicycle).toHaveProperty("id", expect.any(Number))
        expect(bicycle).toHaveProperty("name", expect.any(String))
        expect(bicycle).toHaveProperty("feature", expect.any(String))
        expect(bicycle).toHaveProperty("imageURL", expect.any(String))
        expect(bicycle).toHaveProperty("description", expect.any(String))
        expect(bicycle).toHaveProperty("price", expect.any(Number))
        expect(bicycle).toHaveProperty("StationId", expect.any(Number))
        expect(bicycle).toHaveProperty("status", expect.any(Boolean))

      }
    })
  })
});