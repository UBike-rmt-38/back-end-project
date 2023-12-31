if (process.env.NODE_ENV !== "production") require('dotenv').config();
const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const resolvers = require('./schema/resolvers')
const typeDefs = require('./schema/typeDefs')
const context = require('./middlewares/auth')

async function createApolloServer(options) {
  try {
    const server = new ApolloServer({
      typeDefs: typeDefs,
      resolvers: resolvers,
      introspection: true,
    });  
    const { url } = await startStandaloneServer(server, { listen: options, context: context }) // <==== bug <==== bug-fixed by Bayu
    return { server, url };
  } catch (error) {
    throw error;
  }
}

module.exports = { createApolloServer, startStandaloneServer }