const { verifyToken } = require('../helpers/jwt');
const { User } = require('../models/index');

module.exports = async ({ req }) => {
    const { authorization } = req.headers || '';
    
    if (authorization) {
      const payload = verifyToken(authorization)
      const user = await User.findByPk(payload.id)
      console.log(user, 'dari auth');
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