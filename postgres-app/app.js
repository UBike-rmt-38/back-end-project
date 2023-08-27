if (process.env.NODE_ENV !== "production") require('dotenv').config();
const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const [typeDefs, resolvers] = require('./schema/index')
const context = require('./middlewares/auth')

const options = { port: 0 }

async function createApolloServer(options) {
  try {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      introspection: true,
    });  
    const { url } = await startStandaloneServer(server, { listen: options, context: context }) // <==== bug <==== bug-fixed by Bayu
    return { server, url };
  } catch (error) {
    console.log(error, "<<< masuk error app.js")
    throw error;
  }
}
createApolloServer(options)

module.exports = { createApolloServer, startStandaloneServer }