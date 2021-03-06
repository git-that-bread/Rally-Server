const router = require('express').Router();
const jwt = require('jsonwebtoken');
const volunteerService = require('../../services/volunteerService.js');
let Organization = require('../../models/org.model');
let Admin = require('../../models/admin.model');
let Shift = require('../../models/shift.model');
let volShift = require('../../models/volunteerShift.model');


router.route('/shift/:id').delete(async (req, res, next) => {
    try {
        let deletedShift = await volunteerService.volShiftDelete(req.params.id);
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

router.route('/shift/:id').get(async (req, res, next) => {
    try {
        let volunteerShifts = await volunteerService.getVolShiftList(req.params.id);
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

router.route('/orgs/events/:id').get(async (req, res, next) => {
    try {
        let eventList = await volunteerService.getEventList(req.params.id);
        return res.status(200).json({Events: eventList});
    } catch (error) {
        next(error);
    }
});

router.route('/orgs/events/shifts/:id').get(async (req, res, next) => {
    try {
        let shiftList = await volunteerService.getShiftList(req.params.id);
        return res.status(200).json({Shifts: shiftList});
    } catch (error) {
        next(error);
    }
});


module.exports = router;