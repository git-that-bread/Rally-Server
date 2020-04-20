
/**
 * Express router providing the api for the client app.
 * @module routers/api
 */

const router = require('express').Router();
const middleware = require('./middleware/middleware');

const authRouter = require('./auth');
router.use('/auth', authRouter);

const adminRouter = require('./admin');
router.use('/admin', adminRouter);
adminRouter.use('/', middleware.checkAuthentication);


const volRouter = require('./volunteer');
volRouter.use('/', middleware.checkAuthentication);
router.use('/volunteer', volRouter);

const orgRouter = require('./organization');
router.use('/orgs', orgRouter);

module.exports = router;
