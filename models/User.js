const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
    },
    resetToken: {
        type: String
    },
    resetExpirationTime: {
        type: Date
    },
    authToken: {
        type: String
    },
    authTokenExpirationTime: {
        type: Date
    },
    isBlocked: {
        type: String,
        default: false
    },
    unBlockTime: {
        type: Date,
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;