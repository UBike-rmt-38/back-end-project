const { createApolloServer } = require("../app");

const request = require("supertest");

// getBicycles
const getBicycles = { // <==== The query bug has been resolved.
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
/* NOTES dari Bayu : 
  penulisan query yang tepat seperti ini yaaa
  bener2 cuma tinggal copy paste semua aja dari Apollo Studio Sandbox
*/

let server, url;

beforeAll(async () => {
  const { server: apolloServer, url: serverUrl } = await createApolloServer({
    port: 0,
  });
  server = apolloServer;
  url = serverUrl;
});

afterAll(async () => {
  await server?.stop();
});

describe("GraphQL Test Coverage", () => {
  describe("getPost", () => {
    test("success return array of object and return 200", async () => {
      const response = await request(url)
        .post("/")
        .send(getBicycles);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object); // <=== body nya GraphQL itu property bername "data" yang mana itu Object, bukan Array
      expect(response.errors).toBeUndefined(); // <=== jika mengecek errors harus undefined, pastikan di resolver nya throw error

      if (response.body.length > 0) {
        const bicycle = response.body[0];

        expect(bicycle).toHaveProperty("id", expect.any(Number));
        expect(bicycle).toHaveProperty("name", expect.any(String));
        expect(bicycle).toHaveProperty("feature", expect.any(String));
        expect(bicycle).toHaveProperty("imageURL", expect.any(String));
        expect(bicycle).toHaveProperty("description", expect.any(String));
        expect(bicycle).toHaveProperty("price", expect.any(Number));
        expect(bicycle).toHaveProperty("StationId", expect.any(Number));
        expect(bicycle).toHaveProperty("status", expect.any(Boolean));
      }
    });
  });
});