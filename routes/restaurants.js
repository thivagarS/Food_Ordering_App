const express = require("express");

const restaurantController = require('../controllers/restaurants');

const router = express.Router();

/*
    @Method - POST
    @Auth - required
    @Desc - This route is used to add restaurant to the application
*/
router.post('/add', restaurantController.postAddRestaurant);
/*
    @Method - PATCH
    @Auth - not required
    @Desc - This route is used to verify email account for the resturant
*/
router.patch('/verification/:token', restaurantController.patchVerifyRestaurantEmail);
/*
    @Method - PATCH
    @Auth - required
    @Desc - This route is used to change restaurant availability status
*/
router.patch('/changeAvailability', restaurantController.patchChangeRestaurantAvailability);
/*
    @Method - PATCH
    @Auth - required
    @Desc - This route is used to add category.
*/
router.patch('/category/add', restaurantController.patchAddCategory);
/*
    @Method - PATCH
    @Auth - required
    @Desc - This route is used to add sub category.
*/
router.patch('/subCategory/add', restaurantController.patchAddSubCategory);
/*
    @Method - PATCH
    @Auth - required
    @Desc - This route is used to item to the sub category.
*/
router.patch('/item/add', restaurantController.patchAddItem);
/*
    @Method - PATCH
    @Auth - required
    @Desc - This route is used to update the item.
*/
router.patch('/item/edit', restaurantController.patchEditItem);

module.exports = router;