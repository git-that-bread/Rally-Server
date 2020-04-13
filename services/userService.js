/**
 * userService - Methods providing user related services.
 * @module services/userService
 */

const Volunteer = require('../models/volunteer.model');
const Admin = require('../models/admin.model');
const Organization = require('../models/org.model');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * createUser - Helper method
 * This helper method handles the user account creation.
 *
 * @method createUser
 * @param {object} user  - an object representing an Admin or Volunteer to associate this User object with.
 * @param {object} userInfo  - An object representing the user info from a request.
 * @returns {User} - The User object created and saved to the database.
 **/        
const createUser = async (userInfo) => {
    // create User and add to db
    let username = userInfo.username;
    let email = userInfo.email;
    let password = userInfo.password;

    const countUser = await User.countDocuments({email});
    if(countUser > 0) {
        throw ({ status: 409, code: 'USER_ALREADY_EXISTS', message: 'A user already exists with this email.' });
    }
    const hash = await bcrypt.hash(password, 10);
    const newUser = new User({username, password:hash, email});
    const savedUser = await newUser.save();
    console.log(`User ${savedUser} successfully created!`);
    return savedUser;
};

/**
 * createVolunteer - Helper method
 * This helper method handles the creation of a Volunteer object.
 *
 * @method createVolunteer
 * @param {object} userInfo  - An object representing the user info from a request.
 * @returns {object} - An object with the following fields type: 'volunteer', obj, id.
 **/      
const createVolunteer = async (userInfo) => {
    const newVolunteer = new Volunteer({name: userInfo.name});
    const savedVolunteer = await newVolunteer.save();
    console.log(`New volunteer user successfully added to the db ${savedVolunteer}`);
    return savedVolunteer;
};

/**
 * createAdmin - Helper method
 * This helper method handles the creation of an Admin object.
 *
 * @method createAdmin
 * @param {object} userInfo  - An object representing the user info from a request.
 * @returns {object} - An object with the following fields type: 'volunteer', obj, org, id.
 **/  
const createAdmin = async (userInfo) => {
    const newOrganization = new Organization({orgName: userInfo.orgName, orgType: userInfo.orgType, location: userInfo.location, orgPhone: userInfo.orgPhone, orgEmail: userInfo.orgEmail});
    const savedOrg = await newOrganization.save();
    console.log(`New organization user successfully added to the db ${newOrganization}`);
    const newAdmin = new Admin({name: userInfo.adminName, adminPhone: userInfo.adminPhone, organization: savedOrg._id});
    const savedAdmin = await newAdmin.save();
    const updatedOrgRes = await Organization.findOneAndUpdate(
        { _id: savedOrg._id },
        { $push: { admins: savedAdmin._id  } });
    console.log("Organization admins field updated ", updatedOrgRes);
    return savedAdmin;
};

/**
 * signUp - Service method
 * This service method handles the registration of a user.
 *
 * @method userService.signUp
 * @param {object} userInfo  - An object representing the user info from a request.
 * @returns {User} - An object representing a User.
 * @memberof module:services/userService~userService
 **/ 
const signUp = async (userInfo) => {
    // TODO: add transactions later on to ensure User and underlying user object are both created and saved in the db.
    // Create user
    const user = await createUser(userInfo);
    const userType = userInfo.userType;
    let underlyingUser;
    let update;
    // check userType
    if(userType === 'volunteer') {
        // create volunteer and add to db
        underlyingUser = await createVolunteer(userInfo);
        user._volunteer = underlyingUser._id;
    }else if(userType === 'admin') {
        // create org and add to db
        underlyingUser = await createAdmin(userInfo);
        user._admin = underlyingUser._id;
    }

    // Associate user with underlying user
    const updatedUser = await user.save();
    console.log(updatedUser);
    return updatedUser;
}

/**
 * logIn - Service method
 * This service method handles the log in of a user.
 *
 * @method userService.logIn
 * @param {object} userInfo - An object representing the user info from a request.
 * @returns {User} - An object representing a User.
 * @memberof module:services/userService~userService
 **/
const logIn = async (userInfo) => {
    console.log(userInfo)
    let username = userInfo.username;
    let email = userInfo.email;
    let password = userInfo.password;

    const countUser = await User.countDocuments({username});
    if(countUser === 0) {
        throw ({ status: 404, code: 'USER_NOT_EXISTS', message: 'E-mail address does not exist.' });
    }

    const user = await User.findOne({username});
    const validPassword = await bcrypt.compare(password, user.password);
    if (validPassword) {
        const token = jwt.sign({
            email: user.email,
            userId: user._id
        }, process.env.JWT_KEY, { expiresIn: '24h' });
        return {
            user,
            token
        };
    }
    throw ({ status: 401, code: 'LOGIN_INVALID', message: 'Invalid authentication credentials.' });
}

module.exports = {
    signUp,
    logIn
};
