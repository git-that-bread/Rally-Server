const login = require('./loginMiddleware');
const signup = require('./signupMiddleware');

const checkAuthentication = async (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
  if(!token) {
    return res.status(404).send({code: 'TOKEN_MISSING', message: 'An authorization token was not provided in the request header.' });
  }
  if (token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }

  if (token) {
    try {
      const decoded = await jwt.verify(token, process.env.JWT_KEY);
      req.decoded = decoded;
      const user = await User.findById(decoded.sub.userId);
      console.log("user authenticated: ");
      console.log(user);
      if (!user){
        return res.status(404).send({code: 'USER_NOT_EXISTS', message: 'User does not exist.' });
      } else {
        req.user = user;
        req.decoded = decoded;
        next();
      }
    } catch (error) {
      next(error);
    }
  }
};

module.exports = {
  login,
  signup,
  checkAuthentication
}