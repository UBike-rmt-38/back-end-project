const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

function generateAccessToken(user) {
  const { id, email, username } = user;
  return jwt.sign({ id, email, username }, JWT_SECRET);
}

function verifyAccessToken(access_token) {
  return jwt.verify(access_token, JWT_SECRET);
}

module.exports = { generateAccessToken, verifyAccessToken };
