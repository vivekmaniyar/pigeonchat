const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: { type: String, required: true },
    username: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true},
    isAdmin: {type: Boolean, required: true, default: false},
    isBlocked: {type: Boolean, required: true, default: false},
    profileimage: {
        type: String,
        required: true,
        default: 'https://res.cloudinary.com/dvml1uyhb/image/upload/v1664801689/default_user_image_qwmfov.png'
    }
},{
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);