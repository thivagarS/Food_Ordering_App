const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const resturantSchema = new Schema({
    // userId: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User'
    // },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    emailVerificationToken: {
        type: String
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    zipCode: {
        type: Number,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    isAvailableForOrder: {
        type: Boolean,
        default: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    position: {
        latitude: {
            type: String,
            required: true
        },
        longitude: {
            type: String,
            required: true
        }
    }
}, { timestamps: true})

const Restaurant = mongoose.model('Restaurants', resturantSchema);

module.exports = Restaurant;