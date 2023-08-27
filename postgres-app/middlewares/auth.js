const { verifyToken } = require('../helpers/jwt');
const { User } = require('../models/index');

module.exports = async ({ req }) => {
    const { authorization } = req.headers || '';
    
    console.log(authorization, "<<<< Auth");
    if (authorization) {
      const payload = verifyToken(authorization)
      const user = await User.findByPk(payload.id)
      if(!user) {
        const error = { message: 'Authorization token invalid' }
        return { error} 
      }
      return{ user}
    } else {
        const error = { message: 'Authorization token invalid' }
        return { error }
    }
}