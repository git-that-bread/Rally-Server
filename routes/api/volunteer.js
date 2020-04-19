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
        return res.status(200).json({});
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

router.route('/shift').get(async (req, res, next) => {
    try {
        let volunteerShifts = await volunteerService.getVolShiftList(req.body);
        return res.status(200).json({VolunteerShifts: volunteerShifts});
    } catch (error) {
        next(error);
    }
});

router.route('/orgs').post(async (req, res, next) => {
    try {
        let orgSignedUp = await volunteerService.orgSignUp(req.body);
        return res.status(200).json({data: orgSignedUp});
    } catch (error) {
        next(error);
    }
});

router.route('/orgs').get(async (req, res, next) => {
    try {
        let orgList = await volunteerService.getOrgList(req.body);
        return res.status(200).json({Organizations: orgList});
    } catch (error) {
        next(error);
    }
});

router.route('/orgs/events').get(async (req, res, next) => {
    try {
        let eventList = await volunteerService.getEventList(req.body);
        return res.status(200).json({Events: eventList});
    } catch (error) {
        next(error);
    }
});

router.route('/orgs/events/shifts').get(async (req, res, next) => {
    try {
        let shiftList = await volunteerService.getShiftList(req.body);
        return res.status(200).json({Shifts: shiftList});
    } catch (error) {
        next(error);
    }
});


module.exports = router;