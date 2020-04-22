const router = require('express').Router();
const adminService = require('../../services/adminService.js');
let Volunteer = require('../../models/volunteer.model');
let Volshift = require('../../models/volunteerShift.model');
let Event = require('../../models/event.model');


router.route('/volunteers/:id').get(async (req, res, next) => {
    try {
        let volunteers = await adminService.getVolunteerList(req.params.id);
        return res.status(200).json({ Volunteers: volunteers });
    } catch (error) {
        next(error);
    }
});

router.route('/volunteers/pending/:id').get(async (req, res, next) => {
    try {
        let pendingVolunteers = await adminService.viewPendingVols(req.params.id);
        return res.status(200).json({PendingVolunteers: pendingVolunteers });
    } catch (error) {
        next(error);
    }
});

router.route('/volunteers/pending').post(async (req, res, next) => {
    try {
        let approvedVolunteer = await adminService.approveVol(req.body);
        return res.status(200).json({ApprovedVolunteer: approvedVolunteer });
    } catch (error) {
        next(error);
    }
});

router.route('/volunteers/pending/reject').post(async (req, res, next) => {
    try {
        let updatedOrg = await adminService.rejectVol(req.body);
        return res.status(200).json({UpdatedOrg: updatedOrg });
    } catch (error) {
        next(error);
    }
});

router.route('/volunteers/remove').post(async (req, res, next) => {
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
        return res.status(200).json({Event: event });
    } catch (error) {
        next(error);
    }
});

router.route('/events').get(async (req, res, next) => {
    try {
        let eventList = await adminService.getEventList(req.query.orgId);
        return res.status(200).json({Events: eventList});
    } catch (error) {
        next(error);
    }
});

router.route('/event/:id').delete(async (req, res, next) => {
    try {
        console.log("delete route")
        let eventD = await adminService.deleteEvent(req.params.id);
        return res.status(200).json({data: eventD});
    } catch (error) {
        next(error);
    }
});

router.route('/event/update').post(async (req, res, next) => {
    try {
        let eventUpdate = await adminService.updateEvent(req.body);
        return res.status(200).json({UpdatedEvent: eventUpdate});
    } catch (error) {
        next(error);
    }
});

router.route('/event/shifts/:id').get(async (req, res, next) => {
    try {
        let shiftList = await adminService.getShiftList(req.params.id);
        console.log(req.params)
        return res.status(200).json({shifts: shiftList});
    } catch (error) {
        next(error);
    }
});

router.route('/event/:id').get(async (req, res, next) => {
    try {
        let event = await adminService.getEvent(req.params.id);
        return res.status(200).json({event});
    } catch (error) {
        next(error);
    }
});

router.route('/shift').put(async (req,res, next) => {
    try {
        let shiftUpdate = await adminService.updateShift(req.body);
        return res.status(200).json({data: shiftUpdate});
    } catch (error) {
        next(error);
    }
});

router.route('/shift').post(async (req,res, next) => {
    try {
        let shift = await adminService.createShift(req.body);
        return res.status(200).json({shift});
    } catch (error) {
        next(error);
    }
});

router.route('/shift/:id').delete(async (req, res, next) => {
    try {
        let shiftD = await adminService.deleteShift(req.params.id);
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

router.route('/volunteerShifts/:orgId').get(async (req,res, next) => {
    try {
        const volShifts = await adminService.getVolunteerShifts(req.params.orgId);
        return res.status(200).json({volunteerShifts: volShifts});
    } catch (error) {
        next(error);
    }
});

router.route('/shift/:id').get(async (req, res, next) => {
    try {
        let volList = await adminService.getVolsOfShift(req.params.id);
        return res.status(200).json({data: volList});
    } catch (error) {
        next(error);
    }
});

module.exports = router;