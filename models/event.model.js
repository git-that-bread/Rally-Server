const mongoose = require('mongoose');

const theSchema = mongoose.Schema;

const eventSchema = new theSchema({
   
    volunteers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Volunteer'
    }],
    shifts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shift'
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
    organization:
    {
        type: mongoose.Schema.Types.ObjectId
    },
    location:
    {
        type: String
    }
},
{
    timestamps: true,
});

const event = mongoose.model('event', eventSchema);

module.exports = event;