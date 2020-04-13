/**
 * Express middleware for use in the signup route.
 */

const validateSignup = (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    if(!username) {
        return res.status(403).json('Login failed. Username field is null');
    }
    if(!password) {
        return res.status(403).json('Login failed. Password field is null');
    }
    if(!email) {
        return res.status(403).json('Login failed. Email field is null');
    }
    let userType = req.body.userType;
    if(!userType) {
        console.error("No type of account/user specified by the client");
        return res.status(403).json({status: "fail", message: "Error: Must specify the type of user i.e userType: 'admin'"})
    }
    next();
};

module.exports = {
    validateSignup
};
