const express = require("express");

const restaurantController = require('../controllers/restaurants');
const { isAuth } = require("../middleware/isAuth");

const router = express.Router();

/*
    @Method - POST
    @Auth - required
    @Desc - This route is used to add restaurant to the application
*/
router.post('/add', isAuth, restaurantController.postAddRestaurant);
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
router.patch('/changeAvailability', isAuth, restaurantController.patchChangeRestaurantAvailability);
/*
    @Method - GET
    @Auth - not required
    @Desc - This route is used to get all restaurant.
*/
router.get('/all', restaurantController.getRestaurants);
/*
    @Method - GET
    @Auth -  required
    @Desc - This route is used to get all restaurant for particular user.
*/
router.get('/user/all', isAuth, restaurantController.getRestaurantsForUser);
/*
    @Method - GET
    @Auth - not required
    @Desc - This route is used to get particular restaurant.
*/
router.get('/:restaurantId', restaurantController.getRestaurant);
/*
    @Method - GET
    @Auth - not required
    @Desc - This route is used to get restaurant menu.
*/
router.get('/menu/:restaurantId', restaurantController.getRestaurantMenu);
/*
    @Method - GET
    @Auth - required
    @Desc - This route is used to get menu for user's restaurant.
*/
router.get('/menu/:restaurantId', restaurantController.getUserRestaurantMenu);

/*
    @Method - PATCH
    @Auth - required
    @Desc - This route is used to add category.
*/
router.patch('/category/add', isAuth, restaurantController.patchAddCategory);
/*
    @Method - PATCH
    @Auth - required
    @Desc - This route is used to edit category.
*/
router.patch('/category/edit/:categoryId', isAuth, restaurantController.patchEditCategory);
/*
    @Method - PATCH
    @Auth - required
    @Desc - This route is used to delete category.
*/
router.patch("/category/delete/:categoryId", isAuth, restaurantController.patchDeleteCategory);
/*
    @Method - PATCH
    @Auth - required
    @Desc - This route is used to add sub category.
*/
router.patch('/subCategory/add', isAuth, restaurantController.patchAddSubCategory);
/*
    @Method - PATCH
    @Auth - required
    @Desc - This route is used to add sub category.
*/
router.patch('/subCategory/edit/:subCategoryId', isAuth, restaurantController.patchEditSubCategory);
/*
    @Method - PATCH
    @Auth - required
    @Desc - This route is used to delete sub category.
*/
router.patch('/subCategory/delete/:subCategoryId', isAuth, restaurantController.patchDeleteSubCategory);
/*
    @Method - PATCH
    @Auth - required
    @Desc - This route is used to item to the sub category.
*/
router.patch('/item/add', isAuth, restaurantController.patchAddItem);
/*
    @Method - PATCH
    @Auth - required
    @Desc - This route is used to update the item.
*/
router.patch('/item/edit/:itemId', isAuth, restaurantController.patchEditItem);
/*
    @Method - DELETE
    @Auth - required
    @Desc - This route is used to delete the item.
*/
router.patch('/item/delete/:itemId', isAuth, restaurantController.patchDeleteItem);

module.exports = router;

/*
    -- To get orders
    -- To get menu

*/