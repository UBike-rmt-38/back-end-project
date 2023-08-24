const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const [typeDefs, resolvers] = require('./schema/index')

async function createApolloServer(options) {
  try {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      introspection: true,
    });  
    const { url } = await startStandaloneServer(server, { listen: options }) // <==== bug <==== bug-fixed by Bayu
    return { server, url };
  } catch (error) {
    console.log(error, "<<< masuk error app.js")
    throw error;
  }
}

module.exports = { createApolloServer, startStandaloneServer }