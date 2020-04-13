const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username:
    {
        type: String,
        unique: true,
        trim: true,
        minlength: 5
    },
    password:
    {
        type: String,
        trim: true,
        minlength: 8
    },
    email:
    {
        type: String,
        unique: true,
        trim: true,
    },
    _admin:
    {
        type: mongoose.Schema.Types.ObjectId, ref:'admin'
    },
    _volunteer:
    {
        type: mongoose.Schema.Types.ObjectId, ref:'volunteer'
    }
},
{
    timestamps: true,
});

const user = mongoose.model('user', userSchema);

module.exports = user;