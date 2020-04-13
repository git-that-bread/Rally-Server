const mongoose = require('mongoose');

const theSchema = mongoose.Schema;

const volSchema = new theSchema({
    name:
    {
        type: String,
        trim: true,
        required: true,
        minlength: 5
    },
    shifts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shift'

    }], 
    organizations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'

    }], 
},
{
    timestamps: true,
});

const volunteerMod = mongoose.model('volunteerMod', volSchema);

module.exports = volunteerMod;