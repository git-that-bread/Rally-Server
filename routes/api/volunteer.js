const router = require('express').Router();
const jwt = require('jsonwebtoken');
const volunteerService = require('../../services/volunteerService.js');
let Organization = require('../../models/org.model');
let Admin = require('../../models/admin.model');
let Shift = require('../../models/shift.model');
let volShift = require('../../models/volunteerShift.model');


router.route('/shift').delete(async (req, res, next) => {
    try {
        let deletedShift = await volunteerService.volShiftDelete(req.body);
        return res.status(200).json({data: deletedShift});
    } catch (error) {
        next(error);
    }
});

router.route('/shift').post(async (req, res, next) => {
    try {
        let shiftSignedUp = await volunteerService.shiftSignUp(req.body);
        return res.status(200).json({data: shiftSignedUp});
    } catch (error) {
        next(error);
    }
});

module.exports = router;