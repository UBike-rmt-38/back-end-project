const jwt = require('jsonwebtoken');
const JWT_KEY = process.env.JWT_SECRET

function signToken(user) {
    const { id, email, username } = user
    return jwt.sign({ id, email, username,}, JWT_KEY);
}
function verifyToken(access_token) {
    return jwt.verify(access_token, JWT_KEY);
}

module.exports = { signToken, verifyToken}