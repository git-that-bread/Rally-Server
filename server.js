require('dotenv').config();
const express = require('express');
const cors = require('cors');
const middleware = require('./routes/api/middleware/middleware')

const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

var whitelist = ['http://localhost:3000', 'https://master.d2chga3duas5jb.amplifyapp.com']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}

// cors
app.options('*', cors());

  

// Init Middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('Hello world!'));
app.use(middleware.logger);

// api router
const apiRouter = require('./routes/api/index.js');
app.use('/api', apiRouter);


// Error Handling Middleware
app.use(function (error, req, res, next) {
    console.error(error);
    if(!error.status) {
        return res.status(500).json( { error: { code: 'UNKNOWN_ERROR', message: 'An unknown error occurred.' } });
    } 
    return res.status(error.status).json( { error: { code: error.code, message: error.message } });
});

const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Server running on port ${port}`));
