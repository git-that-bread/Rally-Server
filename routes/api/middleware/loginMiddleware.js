
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

module.exports = {
  validateLogin
}