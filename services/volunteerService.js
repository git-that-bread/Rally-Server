/**
 * volunteerService - Methods providing user related services.
 * @module services/volunteerService
 */

const Volunteer = require('../models/volunteer.model');
const Admin = require('../models/admin.model');
const Organization = require('../models/org.model');
const Event = require('../models/event.model');
const Shift = require('../models/shift.model');
const volShift = require('../models/volunteerShift.model');


/**
 * shiftSignUp - Service Method
 * This method allows a volunteer to signup for a shift, creating a volShift object. Then updates the
 * corresponding Shift object and Event object to add the volunteer to the volunteers[] array for both.
 * 
 * @method shiftSignUp
 * @param {reqInfo} reqInfo - object containing the shift object ID (shiftId), and volunteer object ID (volId)
 * @returns {savedVolShift} savedVolShift
 */
const shiftSignUp = async (reqInfo) => {
    const theShift = await Shift.findOne({_id: reqInfo.shiftId});
    let volunteer = reqInfo.volId
    let shift = reqInfo.shiftId
    let organizationID = theShift.organizationId
    let eventID = theShift.eventId
    var newVolShift = new volShift({volunteer, shift, organizationID, eventID});

    const savedVolShift = await newVolShift.save();

    const updateShiftWithVol = await Shift.findOneAndUpdate(
        {_id: shift},
        {$addToSet: {volunteers: volunteer}}
    );
    const updateEventWithVol = await Event.findOneAndUpdate(
        {_id: eventID},
        {$addToSet: {volunteers: volunteer}}
    );
    const updateVolWithVolShift = await Volunteer.findOneAndUpdate(
        {_id: volunteer},
        {$addToSet: {shifts: newVolShift.id}}
    );

    return savedVolShift;
}

/**
 * volShiftDelete - Service Method
 * This method will allow the user to cancel their shift obligation by deleting the volShift object. This will also need to 
 * go to the corresponding event and shift in order to delete the volunteer object ID from volunteers[] in each
 * 
 * @method volShiftDelete
 * @param {volShiftId} - the object ID of the volunteerShift object (volShiftId)
 * @returns {} - void
 */

const volShiftDelete = async(volShiftId) => {
    //First get the volunteerShift object based on the object ID provided
    const theVolShift = await volShift.findOne({_id: volShiftId});
    let volunteer = theVolShift.volunteer
    let shiftID = theVolShift.shift
    let eventID = theVolShift.eventID
    //Remove volunteer from volunteers[] within shift object
    const removeVolFromShift = await Shift.findOneAndUpdate(
        {_id: shiftID},
        {$pull: {volunteers: volunteer}}
    );
    //Now remove volunteer from volunteers[] within event object
    const removeVolFromEvent = await Event.findOneAndUpdate(
        {_id: eventID},
        {$pull: {volunteers: volunteer}}
    );
    //Delete volunteerShift object
    const deleteVolShift = await volShift.findOneAndDelete({_id: volShiftId});
    //Finally, remove the volunteerShift object ID from the volunteer object's shifts[] array
    const removeShiftFromVol = await Volunteer.findOneAndUpdate(
        {_id: volunteer},
        {$pull: {shifts: volShiftId}}
    );
    return;
};

/**
 * orgSignUp - Service Method
 * This method allows a volunteer to "sign up" with an organization. Adds volunteer object ID to org's volunteers[] array
 * and the org's object ID to volunteer object's organizations[]
 * @method orgSignUp
 * @param {reqInfo} reqInfo - contains the org's object ID (orgID), and volunteer object ID (volID)
 * @returns {} - void
 */
const orgSignUp = async(reqInfo) => {
    //Update the org object's pendingVolunteers[], adding the volunteer object ID
    const addVolID = await Organization.findOneAndUpdate(
        {_id: reqInfo.orgId},
        {$addToSet: {pendingVolunteers: reqInfo.volId}}, {new: true}
    );
    return;
};

/**
 * getEventList - Service Method
 * This method is used to provide the volunteer with a list of events that belong to an org
 * @method getEventList
 * @param {orgInfo} orgId - the object ID of the organization (orgId)
 * @returns {flattenedEventList} - an array of event objects associated with the organization
 */
const getEventList = async (orgId) => {
    const theOrg = await Organization.findOne({_id: orgId});
    var eventIDs = theOrg.events;
    var eventList = [];
    for(i = 0; i < eventIDs.length; i++)
    {
        var theEvent = await Event.find({_id: eventIDs[i]});
        eventList.push(theEvent);
    }
    var flattenedEventList = [].concat.apply([], eventList);
    return flattenedEventList;
};

/**
 * getOrgList - Service Method
 * This method is used to provide the volunteer with a list of events that belong to an org
 * @method getOrgList
 * @param {} void
 * @returns {orgList} - an array of org objects
 */
const getOrgList = async () => {
    var orgList = await Organization.find();
    return orgList;
};

/**
 * getVolShiftList - Service Method
 * This method is used to provide the volunteer with the list of volunteerShifts associated with their account
 * @method getVolShiftList
 * @param {volInfo} volId - the object ID of the volunteer (volID)
 * @returns {flattenedVolShiftList} - an array of volunteerShift objects associated with the volunteer
 */
const getVolShiftList = async (volId) => {
    const theVol = await Volunteer.findOne({_id: volId});
    var volShiftIDs = theVol.shifts;
    var volShiftList = [];
    for(i = 0; i < volShiftIDs.length; i++)
    {
        var theVolShift = await volShift.find({_id: volShiftIDs[i]});
        volShiftList.push(theVolShift);
    }
    var flattenedVolShiftList = [].concat.apply([], volShiftList);
    return flattenedVolShiftList;
};

/**
 * getShiftList - Service Method
 * This method is used to provide the volunteer with the list of shifts that belong to the event
 * @method getShiftList
 * @param {eventInfo} eventId - the object ID of the event (eventID)
 * @returns {flattenedShiftList} - an array of shift objects associated with the event
 */
const getShiftList = async (eventId) => {
    const theEvent = await Event.findOne({_id: eventId});
    var shiftIDs = theEvent.shifts;
    var shiftList = [];
    for(i = 0; i < shiftIDs.length; i++)
    {
        var theShift = await Shift.find({_id: shiftIDs[i]});
        shiftList.push(theShift);
    }
    var flattenedShiftList = [].concat.apply([], shiftList);
    return flattenedShiftList;
};

module.exports = {
    shiftSignUp,
    volShiftDelete,
    getEventList,
    getOrgList,
    getVolShiftList,
    getShiftList,
    orgSignUp
}