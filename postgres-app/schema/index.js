"use strict";
const bcrypt = require("bcrypt");
const {
  User,
  Bicycles,
  Rental,
  Station,
  sequelize,
} = require("../models/index");

const typeDefs = `#graphql

type Query {}

type Mutation {}
`;

const resolvers = {
  Query: {},
  Mutation: {},
};

module.exports = [typeDefs, resolvers];
