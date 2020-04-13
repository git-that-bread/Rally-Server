const mongoose = require('mongoose');

const theSchema = mongoose.Schema;

const orgSchema = new theSchema({
    orgName:
    {
        type: String,
        trim: true,
        required: true,
        minlength: 5
    },
    orgType:
    {
        type: String,
        trim: true
    },
    location:
    {
        type: String,
        trim: true,
        required: true
    },
    orgPhone:
    {
        type: Number,
        trim: true
    },
    orgEmail:
    {
        type: String,
        trim: true,
        required: true
    },
    events:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],
    volunteers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Volunteer'
    }],
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }]
},
{
    timestamps: true,
});

const org = mongoose.model('org', orgSchema);

module.exports = org;