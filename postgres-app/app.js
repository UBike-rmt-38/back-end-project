const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const [typeDefs, resolvers] = require('./schema/index')

const server = new ApolloServer({
    typeDefs: typeDefs,
    resolvers: resolvers,
    introspection: true
})

startStandaloneServer(server, {
    listen: { port: process.env.PORT || 4000 }
}).then(({ url }) => console.log(`🚀 Server ready at ${url}`))

async function createApolloServer(options) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
  });

  const { url, stop } = await server?.listen(options); // <==== bug
  return { server: { stop }, url };
}

module.exports = { createApolloServer }