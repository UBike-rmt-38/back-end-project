if (process.env.NODE_ENV !== "production") require('dotenv').config();
const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const resolvers = require('./schema/resolvers')
const typeDefs = require('./schema/typeDefs')
const context = require('./middlewares/auth')

const server = new ApolloServer({
    typeDefs: typeDefs,
    resolvers: resolvers,
    introspection: true,
})

startStandaloneServer(server, {
    listen: { port: process.env.PORT || 4000 },
    context: context,
}).then(({ url }) => console.log(`🚀 Server ready at ${url}`))