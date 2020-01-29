const crypto = require('crypto');
const { promisify } = require("util");

const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");

const { sendMail } = require('../utils/mailer');
const User = require('../models/User');

const asyncRandomBytes = promisify(crypto.randomBytes);

module.exports.postSignupUser = (req, res, next) => {
    const {
        name,
        email,
        password,   
        confirmPassword,
        phoneNumber,
    } = req.body;
    let token;
    // This will check whether user exists
    User.findOne({ $or: [
        {
            "email": email
        },
        {
            "phoneNumber": phoneNumber
        }
    ]})
    .then(user => {
        if(user) {
            const error = new Error("User Account with same email or phone number exists");
            error.statusCode = 409;
            throw error;
        }
        if(password === confirmPassword) {
            crypto.randomBytes(32, (err, buffer) => {
                if(err) {
                    throw err;
                }
                token = buffer.toString('hex');
                return token;
            })
        } else {
            const error = new Error("Password does not match");
            error.statusCode = 401;
            throw error;
        }
    })
    .then(newToken => {
        token = newToken;
        return bcryptjs.hash(password, 12)
    })
    .then(hashedPassword => {
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            verificationToken: token 
        })
        return newUser.save()
    })
    .then(result => {
        res.status(201).json({
            message: "Account created successfully",
        })
        sendMail({
            to: email,
            from: 'admin@tomato.com',
            subject: 'Account Confirmation mail',
            text: 'Account Confirmation mail',
            html: `<p><a href="http://localhost:8080/auth/verification/${token}" target="_blank"> Click on the link to verify your account</p>`     
        })
        .then(result => {
            console.log("Mail sent");
        })
        .catch(err => {
            console.log(err);
        })
    })
    .catch(err => {
        if(!err.statusCode)
            err.statusCode = 500;
        next(err);
    })
}

module.exports.patchVerifyUserEmail = (req, res, next) => {
    const token = req.params.token;
    // This will verify whether token exists;
    User.findOne({
        verificationToken: token
    })
    .then(result => {
        if(!result) {
            const error = new Error("Token is not valid");
            error.statusCode = 404;
            throw error;
        }
        result.verificationToken = "";
        result.isVerified = true;
        return result.save();
    })
    .then(result => {
        res.status(200).json({
            message: "Email account is verified successfully",
        })
    })
    .catch(err => {
        if(!err.statusCode)
            err.statusCode = 500;
        next(err);
    })
}

module.exports.postLogin = (req, res, next) => {
    const { email, password, loginAttempt } = req.body;
    let loadedUser;
    // This will check whether user email exists
    User.findOne({
        email
    })
    .then(user => {
        if(!user) {
            const error = new Error("Invalid user name or password");
            error.statusCode = 404;
            throw error;
        }
        loadedUser = user;
        return bcryptjs.compare(password, user.password)
    })
    .then(isEqual => {
        if(!isEqual) {
            const error = new Error("Invalid user name or password");
            error.statusCode = 404;
            throw error;
        }
        const token = `Bearer ${jwt.sign(
            {
                email: loadedUser.email, 
                userId: loadedUser._id.toString()
            }, 'secert', {
                expiresIn: '1h'
            })}`;
        console.log(token);
        res.status(200).json({
            token,
            userId: loadedUser._id.toString()
        })
    })
    .catch(err => {
        if(!err.statusCode)
            err.statusCode = 500;
        next(err);
    })
}

module.exports.patchChangePassword = (req, res, next) => {
    const userId = req.userId;
    let loadedUser;
    const { currentPassword, newPassword } = req.body;
    User.findById(userId)
    .then(user => {
        if(!user) {
            const error = new Error("User not found");
            error.statusCode = 401;
            throw error;
        }
        loadedUser = user;
        return bcryptjs.compare(currentPassword, user.password)
    })
    .then(isEqual => {
        // This will check whether current password is same
        if(!isEqual) {
            const error = new Error("Invalid current password");
            error.statusCode = 401;
            throw error;
        }
        console.log(loadedUser.password)
        return bcryptjs.compare(newPassword, loadedUser.password)
    })
    .then(isEqual => {
        // Checks current password and new password
        if(isEqual) {
            const error = new Error("New password is same as old password");
            error.statusCode = 409;
            throw error;
        }
        return bcryptjs.hash(newPassword, 12)
    })
    .then(hashedPassword => {
        loadedUser.password = hashedPassword;
        return loadedUser.save();
    })
    .then(user => {
        res.status(200).json({
            message: "Password changed successfuly"
        })
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

module.exports.patchResetPasswordLink = (req, res, next) => {
    const { email } = req.body;
    let loadedUser;
    User.findOne({
        email
    })
    .then(user => {
        if(!user) {
            const error = new Error("User account does not exists");
            error.statusCode = 404;
            throw error;
        }
        loadedUser = user;
        return asyncRandomBytes(32)
    })
    .then(buffer => {
        const token = buffer.toString('hex');
        loadedUser.resetToken = token;
        loadedUser.resetExpirationTime = Date.now() + 3600000
        return loadedUser.save()
    })
    .then(user => {
        return sendMail({
            to: email,
            from: 'admin@tomato.com',
            subject: 'Password Rest mail',
            text: 'Password Rest mail',
            html: `<p><a href="http://localhost:8080/auth/reset/${user.resetToken}" target="_blank"> Click on the link to reset the password. Link is valid for 20 minutes</p>`        
        })
    })
    .then(result => {
        res.status(200).json({
            message: "Rest password mail sent successfully. Link is valid for one hour"
        })
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

module.exports.patchResetPassword = (req, res, next) => {
    const token = req.params.token;
    const { newPassword, confirmNewPassword } = req.body;
    let loadedUser;
    if(newPassword === confirmNewPassword) {
        User.findOne({
            resetToken: token,
            resetExpirationTime: {
                $gt: Date.now()
            }
        })
        .then(user => {
            if(!user) {
                const error = new Error("Invalid reset token");
                error.statusCode = 404;
                throw error
            }
            loadedUser = user;
            return bcryptjs.hash(newPassword, 12)
        })
        .then(hashedPassword => {
            loadedUser.password = hashedPassword;
            loadedUser.resetToken = "";
            loadedUser.resetExpirationTime = "";
            return loadedUser.save()
        })
        .then(user => {
            res.status(200).json({
                message: "Password reseted successfully"
            })
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
    } else {
        const error = new Error("Password does not match");
        error.statusCode = 401;
        next(error);
    }
}

