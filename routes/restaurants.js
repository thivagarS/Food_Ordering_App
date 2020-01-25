const express = require("express");

const restaurantController = require('../controllers/restaurants');

const router = express.Router();

/*
    @Method - POST
    @Auth - required
    @Desc - This route is used to add restaurant to the application
*/
router.post('/addRestaurant', restaurantController.postAddRestaurant);
/*
    @Method - PATCH
    @Auth - not required
    @Desc - This route is used to verify email account for the resturant
*/
router.patch('/verification/:token', restaurantController.patchVerifyRestaurantEmail);

module.exports = router;