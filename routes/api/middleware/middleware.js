const login = require('./loginMiddleware');
const signup = require('./signupMiddleware');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const User = require('../../../models/user.model')

const checkAuthentication = async (req, res, next) => {
  console.log("check authorization middleware")
  if (!req.headers.authorization) {
    return res.status(401).send({code: 'TOKEN_MISSING', message: 'An authorization token was not provided in the request header.' });
  }

  var token = req.headers.authorization.split(' ')[1];
  var payload = null;

  try {
    payload = jwt.verify(token, process.env.JWT_KEY);
  }
  catch (err) {
    return res.status(401).send({code: 'TOKEN_INVALID', message: 'An invalid token was provided.' });
  }


if (payload.exp <= moment().unix()) {
    return res.status(401).send({code: 'TOKEN_EXPIRED', message: 'Token has expired.' });
  }

  console.log(payload)
  User.findById(payload.userId).select("-password").then((user) => {
        console.log(user)
        if(!user) {
          return res.status(404).send({code: 'USER_NOT_EXISTS', message: 'User does not exist.' });
        }
        req.user = user;
        next();
  }).catch((error) => {
    next(error);
  });


  
};

module.exports = {
  login,
  signup,
  checkAuthentication
}