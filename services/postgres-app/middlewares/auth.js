"use strict";
const { User } = require("../models");
const { verifyAccessToken } = require("../helpers/jwt");

module.exports = async (req, res, next) => {
  try {
    const { access_token } = req.headers;
    if (!access_token) throw { name: "NoToken" };
    const decoded = verifyAccessToken(access_token);
    const data = await User.findByPk(decoded.id);
    if (!data) throw { name: "Unauthorized" };
    req.user = {
      id: data.id,
      email: data.id,
      username: data.username,
    };
    next();
  } catch (error) {
    next(error);
  }
};
