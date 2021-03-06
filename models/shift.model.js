const mongoose = require('mongoose');

const theSchema = mongoose.Schema;

const shiftSchema = new theSchema({
   
    volunteers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Volunteer'

    }], 
    startTime:
    {
        type: Date,
        required: true

    },
    endTime:
    {
        type: Date,
        required: true
    },
    eventId:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    maxSpots:
    {
        type: Number
    },
    organizationId:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    volunteerShifts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'volunteerShift'
    }]
},
{
    timestamps: true,
});

const shift = mongoose.model('shift', shiftSchema);

module.exports = shift;