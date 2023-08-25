const jwt = require('jsonwebtoken');
const JWT_KEY = process.env.JWT_SECRET


function signToken(user) {
    const { id, email, username } = user
    return jwt.sign({ id, email, username,}, JWT_KEY);
}
function verifyToken(access_token) {
    const payload = jwt.verify(access_token, JWT_KEY) 
    return payload
}

module.exports = { signToken, verifyToken}