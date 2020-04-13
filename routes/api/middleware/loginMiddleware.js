
/**
 * Express middleware for use in the login route.
 */

const jwt = require('jsonwebtoken');

const validateLogin = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  if(!username) {
      return res.status(403).json('Login failed. Username field is null');
  }
  if(!password) {
      return res.status(403).json('Login failed. Password field is null');
  }
  next();
}

const verifyToken = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
  if (token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }

  if (token) {
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Token is not valid'
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(403).json({
      success: false,
      message: 'Auth token is not supplied'
    });
  }
};

module.exports = {
  verifyToken,
  validateLogin
}