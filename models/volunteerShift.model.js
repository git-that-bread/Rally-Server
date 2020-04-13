const mongoose = require('mongoose');

const theSchema = mongoose.Schema;

const volShiftSchema = new theSchema({
   
    volunteer:
    { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Volunteer'
    }, 
    shift:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shift'
    },
    organizationID:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    eventID:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    verified:
    {
        type: Boolean,
        default: false,
        required: true
    }  
},
{
    timestamps: true,
});

const volShift = mongoose.model('volShift', volShiftSchema);

module.exports = volShift;