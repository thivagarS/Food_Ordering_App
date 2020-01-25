const crypto = require('crypto');

const Restaurant = require('../models/restaurants');
const { sendMail } = require('../utils/mailer');

module.exports.postAddRestaurant = (req, res, next) => {
    const { name, 
            email, 
            address, 
            city,
            state,
            zipCode,
            phoneNumber,
            position
        } = req.body;
    try {     
            // This will generate a token
            crypto.randomBytes(32, (err, buffer) => {
                if(err) {
                    return console.log(err);
                }
                const token = buffer.toString('hex');
                const newRestaurant = new Restaurant({
                    name, 
                    email, 
                    emailVerificationToken: token,
                    address, 
                    city,
                    state,
                    zipCode,
                    phoneNumber,
                    position: {
                        latitude: position.latitude,
                        longitude: position.longitude
                    }
                });
                newRestaurant.save()
                .then(result => {
                    res.status(201).json({
                        message: 'Restaurant added successfully',
                        result
                    })
                    // This will send mail to the respective account
                    sendMail({
                        to: email,
                        from: 'admin@tomato.com',
                        subject: 'Restaurant account Confirmation mail',
                        text: 'Restaurant account Confirmation mail',
                        html: `<p><a href="http://localhost:8080/restaurant/verification/${token}" target="_blank"> Click on the link to add your Restaurant</p>`
                    })
                    .then(res => {
                        console.log('Mail sent');
                    })
                    .catch(err => {
                        console.log(err);
                    })
                })
                .catch(err => {
                    console.log(err);
                })
            })
    } catch(err) {
        console.log(err);
    } 
}

module.exports.patchVerifyRestaurantEmail = (req, res, next) => {
    // THis will check whether token is valid
    Restaurant.findOne({
        emailVerificationToken: req.params.token,
        isEmailVerified: false
    })
    .then(restaurant => {
        if(!restaurant) {
            return res.status(204).json({
                message: 'Account is already verified or invalid url'
            })
        }
        restaurant.emailVerificationToken = '';
        restaurant.isEmailVerified = true;
        restaurant.save()
        .then(result => {
            res.status(200).json({
                message: "Email is verified successfully",
                result
            })
        })
        .catch(err => {
            console.log(err);
        })
    })
}