const login = require('./loginMiddleware');
const signup = require('./signupMiddleware');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const User = require('../../../models/user.model')

const checkAuthentication = async (req, res, next) => {
  console.log("check authorization middleware")
  if (!req.headers.authorization) {
    console.error("missing auth token")
    return res.status(401).send({code: 'TOKEN_MISSING', message: 'An authorization token was not provided in the request header.' });
  }

  var token = req.headers.authorization.split(' ')[1];
  var payload = null;

  try {
    payload = jwt.verify(token, process.env.JWT_KEY);
  }
  catch (err) {
    console.error("invalid token ", err)
    return res.status(401).send({code: 'TOKEN_INVALID', message: 'An invalid token was provided.' });
  }


if (payload.exp <= moment().unix()) {
  console.error("expired token ")
    return res.status(401).send({code: 'TOKEN_EXPIRED', message: 'Token has expired.' });
  }

  console.log("payload: ", payload)
  User.findById(payload.userId).select("-password").then((user) => {
        console.log("user")
        console.log(user)
        if(!user) {
          console.error("no user found with given token")
          return res.status(404).send({code: 'USER_NOT_EXISTS', message: 'User does not exist.' });
        }
        req.user = user;
        next();
  }).catch((error) => {
    next(error);
  });


  
};

let logger = (req, res, next) => {
  let current_datetime = new Date();
  let formatted_date =
    current_datetime.getFullYear() +
    "-" +
    (current_datetime.getMonth() + 1) +
    "-" +
    current_datetime.getDate() +
    " " +
    current_datetime.getHours() +
    ":" +
    current_datetime.getMinutes() +
    ":" +
    current_datetime.getSeconds();
  let method = req.method;
  let url = req.url;
  let status = res.statusCode;
  let log = `[${formatted_date}] ${method}:${url} ${status}`;
  console.log(log);
  next();
};

module.exports = {
  login,
  signup,
  checkAuthentication,
  logger
}