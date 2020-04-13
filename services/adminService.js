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
 * createShifts - Helper Method
 * This helper method will call the createShift method to create shift objects and populate the shifts array with them
 * 
 * @method createShiftsArray
 * @param {Date} globalStart - Date containing the starting hour of the event itself
 * @param {Date} globalEnd - Date containing the ending hour of the event itself
 * @param {Number} numHours - the number of hours the event will last
 * @param {id} eventID - the object id of the event
 * @param {id} organizationID - the object id of the organization associated with the event
 * @returns {Array} shiftArray - the array of shift objects
 **/
async function createShiftsArray(globalStart, globalEnd, numHours, eventID, organizationID)
{
    var shiftArray = [];
    var theStart = parseDate(globalStart);
    var theEnd = parseDate(globalEnd);

    for(i = 0; i < numHours; i++)
    {
        theEnd.setHours(globalStart.getHours() + i+1);
        //create the shift object given the start and end time parameters
        var shift = new Shift;
        shift = await createShift(theStart, theEnd, eventID, organizationID);
        //Take shift object that was returned by createShift and push it to shiftArray[]
        shiftArray.push(shift);
        //Now iterate the start time and end time by one hour
        theStart.setHours(globalStart.getHours() + i+1); 
    }
    return shiftArray;
}


/** 
 *createShift - Helper Method
 * This method creates and returns an individual shift object
 * 
 * @method createShift
 * @param {Date} startTime - start time of the individual shift
 * @param {Date} endTime - end time of the individual shift
 * @param {id} eventID - object ID of the event associated with the shift
 * @param {id} organizationID - object id of the organization associated with the shift and event
 * @returns {Shift} - The shift object created and saved to the database
 **/
async function createShift(startTime, endTime, eventID, organizationID)
{
    //create shift object
    console.log('creating shift, start is: ' + startTime);
    console.log('creating shift, end is: ' + endTime);
    //console.log('this eventID is: ' + eventID);
    const newShift = new Shift({startTime, endTime, eventID, organizationID});
    const savedShift = await newShift.save();
    //return shift object
    return savedShift;
}

/**
 * createEvent - Service method
 * This helper method handles event creation. It will create the event object, then call other functions to create the shifts for the event, and finally 
 * update itself to add those shifts to the event object's shifts array. The event must be created before the shifts, otherwise the shifts will not have 
 * an eventID to associate themselves with.
 *
 * @method createEvent
 * @param {object} eventInfo  - An object representing the event info from a request.
 * @returns {Event} - The Event object created and saved to the database.
 **/   
const createEvent = async (eventInfo) => {

    let startTime = parseDate(eventInfo.startTime);
    let endTime = parseDate(eventInfo.endTime);
    let organization = eventInfo.organization;
    let location = eventInfo.location;
    
    var numHours = calcHours(endTime, startTime);
    //console.log('numHours is: ' + numHours);
    //Create new event object 
    var newEvent = new Event({startTime, endTime, organization, location});
    
    const organizationID = organization;
    const eventID = newEvent.id;
    const savedEvent = await newEvent.save();
    //console.log('eventID is: ' + eventID);
    //Create shifts. 
    var fullArray = await createShiftsArray(startTime, endTime, numHours, eventID, organizationID);

    const updatedEventShiftArray = await Event.findOneAndUpdate(
       { _id: savedEvent.id },
       { $push: { shifts: fullArray } }
    );

    const updateOrgWithEvent = await Organization.findOneAndUpdate(
        { _id: organizationID },
        { $push: { events: savedEvent.id } }
    );

    return savedEvent;
};
/**
 * deleteEvent - Service Method
 * This method is used to delete and event. It first deletes all the shifts corresponding to that event, then deletes the event itself
 * then updates the corresponding organization to remove the event from the events[] array
 * @method deleteEvent
 * @param {object} eventInfo - An object containing the event object ID (id) and the organization id (organization)
 * @returns {} - void
 */
const deleteEvent = async (eventInfo) => {
    //First delete all corresponding Shifts to the event
    const deleteShifts = await Shift.deleteMany({eventID: eventInfo.id});
    //Now delete event itself
    const deleteEvent = await Event.findOneAndDelete({_id: eventInfo.id});
    //Now update Org to remove this event from events[]
    const deleteEntryOrg = await Organization.findOneAndUpdate(
        {_id: eventInfo.organization},
        { $pull: {events: eventInfo.id}}
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
            organization: eventInfo.organization, location: eventInfo.organization}}, {new: true}
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
 * verifyShift - Service Method
 * This method is used to update and verify a volunteerShift object
 * @method verifyShift
 * @param {shiftInfo} shiftInfo - contains the volunteerShift info, such as the corresponding shift ID for the volShift
 * @returns {verifShift} - updated volShift object 
 */
const verifyShift = async (volShiftInfo) => {
    const verifShift = await volShift.findOneAndUpdate(
        {_id: volShiftInfo.id},
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
        {_id: shiftInfo.id},
        {$set: {startTime:shiftInfo.startTime, endTime:shiftInfo.endTime, eventID:shiftInfo.eventID}}, {new: true}
    );
    return upShift;
 };

 /**
 * deleteShift - Service Method
 * This method is used to delete a shift
 * 
 * @method deleteShift
 * @param {shiftInfo} shiftInfo - contains the shift's object ID
 * @returns {} - void 
 */
 const deleteShift = async (shiftInfo) => {
    const dShift = await Shift.findOneAndDelete({_id: shiftInfo.id});
    const deleteEntryEvent = await Event.findOneAndUpdate(
        {_id: shiftInfo.eventID},
        { $pull: {shifts: shiftInfo.id}}
    );
    const deleteVolShift = await volShift.deleteMany({shift: shiftInfo.id});

    return;
 }

module.exports = {
    createEvent,
    deleteEvent,
    updateEvent,
    updateShift,
    deleteShift,
    verifyShift
};
