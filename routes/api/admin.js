const router = require('express').Router();
const adminService = require('../../services/adminService.js');
let Volunteer = require('../../models/volunteer.model');
let Volshift = require('../../models/volunteerShift.model');
let Event = require('../../models/event.model');


router.route('/volunteers').get(async (req, res, next) => {
    try {
        let volunteers = await adminService.getVolunteerList(req.body);
        return res.status(200).json({ Volunteers: volunteers });
    } catch (error) {
        next(error);
    }
});

router.route('/volunteers/remove').delete(async (req, res, next) => {
    try {
        let updatedOrg = await adminService.deleteVolunteer(req.body);
        return res.status(200).json({updatedOrg});
    } catch (error) {
        next(error);
    }
});

router.route('/event').post(async (req, res, next) => {
    try {
        let event = await adminService.createEvent(req.body);
        return res.status(200).json({ data: event });
    } catch (error) {
        next(error);
    }
});

router.route('/event').delete(async (req, res, next) => {
    try {
        let eventD = await adminService.deleteEvent(req.body);
        return res.status(200).json({data: eventD});
    } catch (error) {
        next(error);
    }
});

router.route('/event/update').post(async (req, res, next) => {
    try {
        let eventUpdate = await adminService.updateEvent(req.body);
        return res.status(200).json({data: eventUpdate});
    } catch (error) {
        next(error);
    }
});

router.route('/shift').post(async (req,res, next) => {
    try {
        let shiftUpdate = await adminService.updateShift(req.body);
        return res.status(200).json({data: shiftUpdate});
    } catch (error) {
        next(error);
    }
});

router.route('/shift').delete(async (req, res, next) => {
    try {
        let shiftD = await adminService.deleteShift(req.body);
        return res.status(200).json({data: shiftD});
    } catch (error) {
        next(error);
    }
});

router.route('/verify').post(async (req, res, next) => {
    try {
        let verifyShift = await adminService.verifyShift(req.body);
        return res.status(200).json({data: verifyShift});
    } catch (error) {
        next(error);
    }
});

module.exports = router;