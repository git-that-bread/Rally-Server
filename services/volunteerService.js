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
 * @param {shiftInfo} shiftInfo - object containing information about shift and event and also the volunteer object ID
 * @returns {savedVolShift} savedVolShift
 */
const shiftSignUp = async (shiftInfo) => {
    let volunteer = shiftInfo.volunteerID
    let shift = shiftInfo.shiftID
    let organizationID = shiftInfo.organizationID
    let eventID = shiftInfo.eventID
    var newVolShift = new volShift({volunteer, shift, organizationID, eventID});

    const savedVolShift = await newVolShift.save();

    const updateShiftWithVol = await Shift.findOneAndUpdate(
        {_id: shift},
        {$push: {volunteers: volunteer}}
    );
    const updateEventWithVol = await Event.findOneAndUpdate(
        {_id: eventID},
        {$push: {volunteers: volunteer}}
    );

    return savedVolShift;
}

/**
 * volShiftDelete - Service Method
 * This method will allow the user to cancel their shift obligation by deleting the volShift object. This will also need to 
 * go to the corresponding event and shift in order to delete the volunteer object ID from volunteers[] in each
 * 
 * @method volShiftDelete
 * @param {volShiftInfo} - an object containing information about the volunteer shift
 * @returns {} - void
 */

const volShiftDelete = async(volShiftInfo) => {
    let volShiftID = volShiftInfo.volShiftID
    let volunteer = volShiftInfo.volunteerID
    let shiftID = volShiftInfo.shiftID
    let eventID = volShiftInfo.eventID
    //Delete volunteerShift object
    const deleteVolShift = await volShift.findOneAndDelete({_id: volShiftID});
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
    return;
};

/**
 * orgSignUp - Service Method
 * This method allows a volunteer to "sign up" with an organization. Adds volunteer object ID to org's volunteers[] array
 * and the org's object ID to volunteer object's organizations[]
 * @method orgSignUp
 * @param {reqInfo} reqInfo 
 * @returns {addOrgID} - the updated Volunteer object with the organization added
 */
const orgSignUp = async(reqInfo) => {
    let volunteer = reqInfo.volunteerID
    let org = reqInfo.organizationID

    //Update the volunteer object's orgs[], adding the org object ID
    const addOrgID = await Volunteer.findOneAndUpdate(
        {_id: volunteer},
        {$push: {organizations: org}}, {new: true}
    );
    //Update the org object's volunteers[], adding the volunteer object ID
    const addVolID = await Organization.findOneAndUpdate(
        {_id: org},
        {$push: {volunteers: volunteer}}, {new: true}
    );

    return addOrgID;
};

/**
 * getEventList - Service Method
 * This method is used to provide the volunteer with a list of events that belong to an org
 * @method getEventList
 * @param {orgInfo} orgInfo - the object ID of the organization
 * @returns {flattenedEventList} - an array of event objects associated with the organization
 */
const getEventList = async (orgInfo) => {
    const theOrg = await Organization.findOne({_id: orgInfo.orgID});
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
 * getShiftList - Service Method
 * This method is used to provide the volunteer with a list of events that belong to an org
 * @method getShiftList
 * @param {eventInfo} eventInfo - the object ID of the event
 * @returns {flattenedShiftList} - an array of shift objects associated with the event
 */
const getShiftList = async (eventInfo) => {
    const theEvent = await Event.findOne({_id: eventInfo.eventID});
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
    getShiftList,
    orgSignUp
}