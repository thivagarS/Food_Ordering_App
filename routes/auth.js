const express = require('express');

const authController = require('../controllers/auth');
const { isAuth } = require("../middleware/isAuth");

const router = express.Router();

/*
    @Method - POST
    @Auth - not required
    @Desc - This route is used to add user to the application
*/
router.post('/signup', authController.postSignupUser);
/*
    @Method - PATCH
    @Auth - not required
    @Desc - This route is used to verify the email account
*/
router.patch('/verification/:token', authController.patchVerifyUserEmail);
/*
    @Method - GET
    @Auth - not required
    @Desc - This route is used to get the email
*/
router.post('/login', authController.postLogin);
/*
    @Method - PATCH
    @Auth - required
    @Desc - This route is used to change account passowrd
*/
router.patch('/password/change', isAuth, authController.patchChangePassword);
/*
    @Method - PATCH
    @Auth - not required
    @Desc - This route is used to send rest password link
*/
router.patch('/password/reset', authController.patchResetPasswordLink);
/*
    @Method - PATCH
    @Auth - not required
    @Desc - This route is used to reset the password
*/
router.patch('/reset/:token', authController.patchResetPassword);

module.exports = router;
