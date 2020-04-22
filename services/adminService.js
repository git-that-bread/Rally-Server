/**
 * adminService - Methods providing user related services.
 * @module services/adminService
 */

const Volunteer = require('../models/volunteer.model');
const Admin = require('../models/admin.model');
const Organization = require('../models/org.model');
const User = require('../models/user.model');
const Event = require('../models/event.model');
const Shift = require('../models/shift.model');
const volShift = require('../models/volunteerShift.model');

 /** 
  * calcHours - Helper method
  * This helper method returns the number of hours between two dates.
  * Used to determine number of hours in an event, and thus how many shifts are needed
  * 
  * @method calcHours
  * @param {Date} endDate - Date representing the end time of the event (down to the hour)
  * @param {Date} startDate - Date representing the start time of the event (down to the hour)
  * @returns {number} - the number of hours the event will last (and thus how many shifts are needed)
  **/
function calcHours(endDate, startDate)
{
    var eventLength = (endDate.getTime() - startDate.getTime()) / 1000;
    eventLength /= (60 * 60);
    return Math.abs(Math.round(eventLength));
}
/**
 * parseDate - Helper Method
 * This helper method returns a Date object given a string containing the date information 
 * 
 * @method parseDate
 * @param {String} dateInput - the date information in string form
 * @returns {Date} - Date object
 **/
function parseDate(dateInput)
{
    return new Date(dateInput);
}


/** 
 *createShift - 
 * This method creates and returns an individual shift object
 * 
 * @method createShift
 * @param {Date} startTime - start time of the individual shift
 * @param {Date} endTime - end time of the individual shift
 * @param {id} eventId - object ID of the event associated with the shift
 * @param {id} organizationId - object id of the organization associated with the shift and event
 * @returns {Shift} - The shift object created and saved to the database
 **/
async function createShift({startTime, endTime, eventId, organizationId, maxSpots})
{
    //create shift object
    const newShift = new Shift({startTime, endTime, eventId, organizationId, maxSpots});
    const savedShift = await newShift.save();
    const updateEvent = await Event.findOneAndUpdate(
        {_id: eventId},
        { $addToSet: {shifts: savedShift.id}}
    );
    //return shift object
    return savedShift;
}

/**
 * createEvent - Service method
 * This helper method handles event creation. It will create the event object, then call other functions to create the shifts for the event, and finally 
 * update itself to add those shifts to the event object's shifts array. The event must be created before the shifts, otherwise the shifts will not have 
 * an eventId to associate themselves with.
 *
 * @method createEvent
 * @param {object} eventInfo  - An object representing the event info from a request.
 * @returns {Event} - The Event object created and saved to the database.
 **/   
const createEvent = async (eventInfo) => {

    let eventName = eventInfo.eventName;
    let startTime = parseDate(eventInfo.startTime);
    let endTime = parseDate(eventInfo.endTime);
    let organization = eventInfo.organization;
    let location = eventInfo.location;
    let shifts = eventInfo.shifts;

    console.log(eventInfo)
    console.log(eventInfo.shifts)
    console.log(shifts)
    
    var numHours = calcHours(endTime, startTime);
    //Create new event object 
    var newEvent = new Event({startTime, endTime, organization, location, eventName});
    
    const organizationID = organization;
    const savedEvent = await newEvent.save();

    const updateOrgWithEvent = await Organization.findOneAndUpdate(
        { _id: organizationID },
        { $push: { events: savedEvent.id } }
    );

    return savedEvent;
};
/**
 * deleteEvent - Service Method
 * This method is used to delete and event. It first deletes all the shifts corresponding to that event, deletes the event itself
 * then updates the corresponding organization to remove the event from the events[] array
 * @method deleteEvent
 * @param {object} eventInfo - contains the event object ID (eventId)
 * @returns {} - void
 */
const deleteEvent = async (eventId) => {
    console.log("delete event")
    const theEvent = await Event.findOne({_id: eventId});
    //First delete all corresponding Shifts to the event
    const deleteShifts = await Shift.deleteMany({eventId: eventId});
    //Now delete event itself
    const deleteEvent = await Event.findOneAndDelete({_id: eventId});
    //Now update Org to remove this event from events[]
    const deleteEntryOrg = await Organization.findOneAndUpdate(
        {_id: theEvent.organization},
        { $pull: {events: eventId}}
    );
    return;
};
/**
 * updateEvent - Service Method
 * This method is used to update an existing event object
 * @method updateEvent
 * @param {eventInfo} eventInfo - object containing all the event information for the new updated entry
 * @returns {updateEv} - updated event object
 */
const updateEvent = async (eventInfo) => {
    const updateEv = await Event.findOneAndUpdate(
        {_id: eventInfo.id},
        { $set: {startTime: eventInfo.startTime, endTime:eventInfo.endTime, 
            organization: eventInfo.organization, location: eventInfo.location, eventName: eventInfo.eventName}}, {new: true}
    );
    /*Will need to go and edit shifts associated with the event if the times are changed. This will be a mess
      because it would require an update to 
        1) All existing shifts for the event
        2) All existing volunteerShifts for the shifts in that event (some may no longer exist due to time change)
        3) The orgs event array
    */
   return updateEv;
};
/**
 * viewPendingVols - Service Method
 * This method is used for the admin the view the volunteers requesting to join the org
 * @method viewPendingVols
 * @param {orgInfo} orgId - object containing org object ID (orgID)
 * @returns {flattenedPendingVolList} - Array of volunteer objects
 */
const viewPendingVols = async (orgId) => {
    const theOrg = await Organization.findOne({_id: orgId});
    var pendingVolIDs = theOrg.pendingVolunteers;
    var pendingVolList = [];
    for(i = 0; i < pendingVolIDs.length; i++)
    {
        var thePendingVol = await Volunteer.find({_id: pendingVolIDs[i]});
        pendingVolList.push(thePendingVol);
    }
    var flattenedPendingVolList = [].concat.apply([], pendingVolList);
    return flattenedPendingVolList;
};

/**
 * approveVol - Service Method
 * This method is used for the admin to approve a volunteer request to join the org
 * @method approveVol
 * @param {reqInfo} reqInfo - object containing org object ID (orgId), and volunteer object ID (volId)
 * @returns {Volunteer} - Volunteer object added
 */
const approveVol = async (reqInfo) => {
    //Remove the volunteer ID from the pendingVolunteers array of org
    const removePending = await Organization.findOneAndUpdate(
        {_id: reqInfo.orgId},
        {$pull: {pendingVolunteers: reqInfo.volId}}
    );
    //Add the volunteer ID to the volunteer array of org
    const addToVolArray = await Organization.findOneAndUpdate(
        {_id: reqInfo.orgId},
        {$addToSet: {volunteers: reqInfo.volId}}, {new: true}
    );
    //Update the volunteer object's orgs[], adding the org object ID
    const updateVol = await Volunteer.findOneAndUpdate(
        {_id: reqInfo.volId},
        {$addToSet: {organizations: reqInfo.orgId}}, {new: true}
    );
    return updateVol;
};
/**
 * getEventList - Service Method
 * This method is used to provide the admin with a list of events that belong to their org
 * @method getEventList
 * @param {orgInfo} orgInfo - the object ID of the organization (orgID)
 * @returns {flattenedEventList} - an array of event objects associated with the organization
 */
const getEventList = async (orgId) => {
    const theOrg = await Organization.findOne({_id: orgId});
    if(!theOrg) {
        throw ({ status: 404, code: 'ORG_MISSING', message: 'No organization associated with admin user found.' });
    }
    var eventIds = theOrg.events;
    var eventList =[];
    for(i = 0; i < eventIds.length; i++)
    {
        var theEvent = await Event.find({_id: eventIds[i]});
        eventList.push(theEvent);
    }
    var flattenedEventList = [].concat.apply([], eventList);
    return flattenedEventList;
};

/**
 * getEvent - Service Method
 * This method is used to retrieve an Event object
 * @method getEvent
 * @param {ObjectId} eventId - Object Id of an event
 * @returns {Event} - An Event object.
 */
const getEvent = async (eventId) => {
    const event = await Event.findOne({_id: eventId});
    return event;
};

/**
 * getVolsOfShift - Service Method
 * This method is used to provide the admin with a list of volunteers that are registered for a shift
 * @method getVolsOfShift
 * @param {reqInfo} shiftId - the object ID of the shift (shiftId)
 * @returns {flattenedVolList} - an array of volunteer objects
 */
const getVolsOfShift = async (shiftId) => {
    const theShift = await Shift.findOne({_id: shiftId});
    var volIds = theShift.volunteers;
    var volList =[];
    for(i = 0; i < volIds.length; i++)
    {
        var theVol = await Volunteer.find({_id: volIds[i]});
        volList.push(theVol);
    }
    var flattenedVolList = [].concat.apply([], volList);
    return flattenedVolList;
};

/**
 * getVolunteerShifts - Service Method
 * This method is used to retrieve list of  volunteerShift objects associated with an organization.
 * @method getVolunteerShifts
 * @param {ObjectId} organizationID - Object Id of an organization
 * @returns {[VolunteerShift]} - An array of VolunteerShift objects.
 */
const getVolunteerShifts = async (organizationID) => {
    const shifts = await volShift.find({organizationID});
    return shifts;
};

/**
 * verifyShift - Service Method
 * This method is used to update and verify a volunteerShift object
 * @method verifyShift
 * @param {shiftInfo} shiftInfo - contains the object ID for the volunteerShift object (volShiftId)
 * @returns {verifShift} - updated volShift object 
 */
const verifyShift = async (volShiftInfo) => {
    const verifShift = await volShift.findOneAndUpdate(
        {_id: volShiftInfo.volShiftId},
        { $set: {verified: true} }, {new: true}
    );
    return verifShift;
};

/**
 * updateShift - Service Method
 * This method is used to update a shift
 * 
 * @method updateShift
 * @param {shiftInfo} shiftInfo - contains the new shift information. needs a 'shiftID' to specify the shift object ID. 
 * @returns {upShift} - updated shift object 
 */
 const updateShift = async (shiftInfo) => {

    const upShift = await Shift.findOneAndUpdate(
        {_id: shiftInfo.shiftId},
        {$set: {startTime:shiftInfo.startTime, endTime:shiftInfo.endTime, eventId:shiftInfo.eventId, maxSpots:shiftInfo.maxSpots}}, {new: true}
    );
    return upShift;
 };


 /**
 * deleteShift - Service Method
 * This method is used to delete a shift
 * 
 * @method deleteShift
 * @param {shiftInfo} shiftId - contains the shift's object ID (shiftID)
 * @returns {} - void 
 */
 const deleteShift = async (shiftId) => {
    const theShift = await Shift.findOne({_id: shiftId});
    const dShift = await Shift.findOneAndDelete({_id: shiftId});
    const deleteEntryEvent = await Event.findOneAndUpdate(
        {_id: theShift.eventId},
        { $pull: {shifts: shiftId}}
    );
    const deleteVolShift = await volShift.deleteMany({shift: shiftId});
    return;
 };

 /**
 * getShiftList - Service Method
 * This method is used to provide the admin with the list of shifts that belong to the event
 * @method getShiftList
 * @param {eventInfo} eventInfo - the object ID of the event (eventId)
 * @returns {flattenedShiftList} - an array of shift objects associated with the event
 */
const getShiftList = async (eventId) => {
    const shifts = await Shift.find({eventId});
    return shifts;
};

 /**
 * getVolunteerList - Service Method
 * This method is used to get a list of volunteers associated with an organization
 * 
 * @method getVolunteerList
 * @param {orgInfo} orgInfo - contains the org's object ID (orgID)
 * @returns {flattenedVolList} - an array of volunteer objects associated with the organization 
 */
const getVolunteerList = async (orgId) => {
    const theOrg = await Vol.findOne({_id: orgId});
    var volIDs = theOrg.volunteers;
    var volList = [];
    for(i = 0; i < volIDs.length; i++)
    {
        var thevol = await Volunteer.find({_id: volIDs[i]});
        volList.push(thevol);
    } 
    var flattenedVolList = [].concat.apply([], volList);
    return flattenedVolList;
};

/**
 * deleteVolunteer - Service Method
 * This method is used to remove a volunteer from the organization's roster
 * @method deleteVolunteer
 * @param {reqInfo} reqInfo - contains org object Id (orgId) and volunteer object ID (volId)
 * @returns {} - void
 */
const deleteVolunteer = async (reqInfo) => {
    //Remove volunteer from org object's volunteers[] array
    console.log(reqInfo.volId);
    console.log(reqInfo.orgId);
    const delVolFromOrg = await Organization.findOneAndUpdate(
        {_id: reqInfo.orgId},
        {$pull: {volunteers: reqInfo.volId}}, {new: true}
    );
    //Remove org from volunteer object's orgs[] array
    const delOrgFromVol = await Volunteer.findOneAndUpdate(
        {_id: reqInfo.volId},
        {$pull: {organizations: reqInfo.orgId}}, {new: true}
    );
    return delVolFromOrg;
};

/**
 * rejectVol - Service Method
 * This method is used to reject a volunteers request to join an organization
 * @method rejectVol
 * @param {reqInfo} reqInfo - contains org object Id (orgId) and volunteer object ID (volId)
 * @returns {delPendingVolFromOrg} - Updated org object with volunteer removed from pendingVolunteers[]
 */
const rejectVol = async (reqInfo) => {
    const delPendingVolFromOrg = await Organization.findOneAndUpdate(
        {_id: reqInfo.orgId},
        {$pull: {pendingVolunteers: reqInfo.volId}}, {new: true}
    );
    return delPendingVolFromOrg;
};

module.exports = {
    createEvent,
    deleteEvent,
    updateEvent,
    viewPendingVols,
    approveVol,
    rejectVol,
    getEventList,
    getEvent,
    createShift,
    updateShift,
    deleteShift,
    verifyShift,
    getShiftList,
    getVolunteerList,
    deleteVolunteer,
    getVolunteerShifts,
    getVolsOfShift
};
