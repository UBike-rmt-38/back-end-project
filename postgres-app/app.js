if (process.env.NODE_ENV !== "production") require('dotenv').config();
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