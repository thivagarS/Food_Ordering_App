const crypto = require('crypto');

const Restaurant = require('../models/restaurants');
const Menu = require('../models/menu');

const { sendMail } = require('../utils/mailer');

/*
    @Function name - findCategoryById
    @Parameters - categoryId, restaurantId
    @Description - This will search for category based on category id and resturant id
    @Return type - Promise
*/
const findCategoryById = (categoryId, restaurantId) => {
    return Menu.findOne({
        restaurantId,
        "category": {
            $elemMatch: {
                _id: categoryId
            }
        }
    })
}

/*
    @Function name - findSubCategoryById
    @Parameters - subCategoryId, categoryId, restaurantId
    @Description - This will search for sub category based on sub category id,category id and resturant id
    @Return type - Promise
*/
const findSubCategoryById = (subCategoryId, categoryId, restaurantId) => {
    return Menu.findOne({
        restaurantId,
        "category": {
            $elemMatch: {
                _id: categoryId,
                "subCategory": {
                    $elemMatch: {
                        _id: subCategoryId
                    }
                }
            }
        }
    })
}

/*
    @Function name - findItemById
    @Parameters - itemId, subCategoryId, categoryId, restaurantId
    @Description - This will search for item Id based on item Id,sub category id,category id and resturant id
    @Return type - Promise
*/
const findItemById = (itemId, subCategoryId, categoryId, restaurantId) => {
    return Menu.findOne({
        restaurantId,
        "category": {
            $elemMatch: {
                _id: categoryId,
                "subCategory": {
                    $elemMatch: {
                        _id: subCategoryId,
                        "item": {
                            $elemMatch: {
                                _id: itemId
                            }
                        }
                    }
                }
            }
        },
    })
}

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
                let restaurantResult = undefined;
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
                    restaurantResult = result;
                    const newMenu = new Menu({
                        restaurantId: result._id
                    })
                    return newMenu.save()
                })
                .then(result => {
                    res.status(201).json({
                        message: "Restaurant added successfully",
                        result: restaurantResult
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
                    if(!err.statusCode) 
                        err.statusCode = 500;
                    next(err);
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
            const error = new Error('Account is already verified or invalid url');
            error.statusCode = 204;
            throw error;
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
            if(!err.statusCode)
                err.statusCode = 500;
            next(err);
        })
    })
}

module.exports.getRestaurants = (req, res, next) => {
    let totalCount;
    Restaurant.countDocuments({})
    .then(count => {
        totalCount = count;
        return Restaurant.find()
    })
    .then(result => {
        res.status(200).json({
            message: "Fetched All restaurants",
            count: totalCount,
            result
        })
    })
    .catch(err => {
        if(!err.statusCode)
            err.statusCode = 500;
        next(err);
    })
}

module.exports.getRestaurant = (req, res, next) => {
    const restaurantId = req.params.restaurantId;
    Restaurant.findOne({
        _id: restaurantId
    })
    .then(result => {
        // This will check whether restaurant exists
        if(!result) {
            const error = new Error('Restaurant does not exists');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message: "Restaurant found successfully",
            result
        })
        .catch(err => {
            if(!err.statusCode)
                err.statusCode = 500;
            next(err);
        })
    })
}

module.exports.getRestaurantsForUser = (req, res, next) => {
    const userId = req.body.userId; // change
    Restaurant.find({
        userId
    })
    .then(result => {
        res.status(200).json({
            message: "Restaurant found for the user",

        })
    })
    .catch(err => {
        if(!err.statusCode)
            err.statusCode = 500;
        next(err);
    })
}

module.exports.getRestaurantMenu = (req, res, next) => {
    return null;
    // Need to implement
}
module.exports.patchChangeRestaurantAvailability = (req, res, next) => {
    const restaurantId = req.body.restaurantId; 
    // This will be change the resturant availability
    Restaurant.findById(restaurantId)
    .then(result => {
        // This will check whether resturant email account is verified
        if(result.isEmailVerified) {
            result.isAvailableForOrder = !result.isAvailableForOrder;
            return result.save()
        }
        const error = new Error('Aactivate email account to open restaurant for orders');
        error.statusCode = 401;
        throw error;
    })
    .then(result => {
        res.status(200).json({
            message: "Restaurant Availability is updated successfully",
            restaurantAvailabilityStatus: result.isAvailableForOrder
        })
    })
    .catch(err => {
        console.log(err);
        if(!err.statusCode) 
            err.statusCode = 500;
        next(err);
    })
}

module.exports.patchAddCategory = (req, res, next) => {
    const { restaurantId, name } = req.body;
    const lowerCaseName = name.toLowerCase();
    Menu.findOne({
        restaurantId,
        "category": {
            $elemMatch: {
                name: lowerCaseName
            }
        }
    })
    .then(result => {
        console.log(result)
        if(result) {
            const error = new Error("Category is already created ...");
            error.statusCode = 409;
            throw error
        }
        return Menu.findOneAndUpdate({
            restaurantId
        }, {
            $push: {
                "category": {
                    name: lowerCaseName
                }
            }
        }, {
            new: true
        })
    })
    .then(result => {
        res.status(200).json({
            message: "Category is created successfully",
            result
        });
    })
    .catch(err => {
        if(!err.statusCode)
            err.statusCode = 500;
        next(err);
    })
};

module.exports.patchEditCategory = (req, res, next) => {
    const { categoryId } = req.params;
    const { restaurantId, name } = req.body;
    const formattedName = name.toLowerCase();
    // This will check whether category exists
    findCategoryById(categoryId, restaurantId)
    .then(result => {
        // This will check whether category exists
        if(!result) {
            const error = new Error("Category does not exists");
            error.statusCode = 409;
            throw error;
        }
        // This will update the category
        return Menu.findOneAndUpdate({
            restaurantId,
        }, {
            "category.$[elem].name": formattedName
        }, {
            new: true,
            arrayFilters: [
                {
                    "elem._id": categoryId
                }
            ]
        })
    })
    .then(result => {
        res.status(200).json({
            message: "Category is updated successfully",
            result
        })
    })
    .catch(err => {
        if(!err.statusCode)
            err.statusCode = 500;
        next(err);
    })
}

module.exports.patchDeleteCategory = (req, res, next) => {
    const { categoryId } = req.params;
    const { restaurantId } = req.body;
    // This will find the category exists or not
    findCategoryById(categoryId, restaurantId)
    .then(result => {
        if(!result) {
            const error = new Error("Category does not exists");
            error.statusCode = 409;
            throw error;
        }
        return Menu.findOneAndUpdate({
            restaurantId
        }, {
            $pull: {
                "category": {
                    _id: categoryId
                }
            }
        }, {
            new: true
        })
    })
    .then(result => {
        res.status(200).json({
            message: "Category is removed successfully",
            result
        })
    })
    .catch(err => {
        if(!err.statusCode)
            err.statusCode = 500;
        next(err);
    })
}

module.exports.patchAddSubCategory = (req, res, next) => {
    const { restaurantId, categoryId,  subCategoryName} = req.body;
    const subCategoryLoweCaseName = subCategoryName.toLowerCase();
    // THis will check whether sub category exists for the selected category
    Menu.findOne({
        restaurantId, 
        "category": {
            $elemMatch: {
                _id: categoryId,
                subCategory: {
                    $elemMatch: {
                        name: subCategoryLoweCaseName
                    }
                }
            }
        }
    })
    .then(result => {
        if(result) {
            const error = new Error("Sub Category is exists for the selected category");
            error.statusCode = 409;
            throw error;
        }
        // This will create sub category for the selected category
        return Menu.findOneAndUpdate({ 
            restaurantId, 
        }, { 
            $push: {
                "category.$[element].subCategory": {
                    name: subCategoryLoweCaseName
                }
            }
        }, {
            arrayFilters: [{ "element._id": categoryId
            }],
            new: true
        })
    })
    .then(result => {
        res.status(200).json({
            message: "Sub Category is added successfully to the selected category",
            result
        })
    })
    .catch(err => {
        if(!err.statusCode) 
            err.statusCode = 500;
        next(err);
    })
};

module.exports.patchEditSubCategory = (req, res, next) => {
    const { subCategoryId } = req.params;
    const { restaurantId, categoryId, name } = req.body;
    const formattedName = name.toLowerCase();
    // This will check whether sub category exists
    findSubCategoryById(subCategoryId, categoryId, restaurantId)
    .then(result => {
        // This will check whether sub category exists
        if(!result) {
            const error = new Error("Sub Category is does not exists for the selected category");
            error.statusCode = 409;
            throw error;
        }
        return Menu.findOneAndUpdate({
            restaurantId
        }, {
            "category.$[categoryElem].subCategory.$[subCategoryElem].name": formattedName
        }, {
            new: true,
            arrayFilters: [
                {
                    "categoryElem._id": categoryId 
                },
                {
                    "subCategoryElem._id": subCategoryId
                }
            ]
        })
    })
    .then(result => {
        res.status(200).json({
            message: "Sub Category is updated successfully",
            result
        })
    })
    .catch(err => {
        if(!err.statusCode) 
            err.statusCode = 500;
        next(err);
    })
}

module.exports.patchDeleteSubCategory = (req, res, next) => {
    const { subCategoryId } = req.params;
    const { restaurantId, categoryId } = req.body;
    // This will check whether sub category exists
    findSubCategoryById(subCategoryId, categoryId, restaurantId)
    .then(result => {
        // This will check whether sub category exists
        if(!result) {
            const error = new Error("Sub Category is does not exists for the selected category");
            error.statusCode = 409;
            throw error;
        }
        // This will delete the sub category
        return Menu.findOneAndUpdate({
            restaurantId
        }, {
            $pull: {
                "category.$[elem].subCategory": {
                    _id: subCategoryId
                }
            }
        }, {
            new: true,
            arrayFilters: [
                {
                    "elem._id": categoryId
                }
            ]
        })
    })
    .then(result => {
        res.status(200).json({
            message: "Sub category is removed successfully",
            result
        })
    })
    .catch(err => {
        if(!err.statusCode)
            err.statusCode = 500;
        next(err);
    })
}
module.exports.patchAddItem = (req, res, next) => {
    const { restaurantId, categoryId, subCategoryId, name, description, rate, isVeg } = req.body;
    const formattedItemName = name.toLowerCase();
    // This will check whether the item is exist under same category n same sub category
    Menu.findOne({
        restaurantId,
        "category": {
            $elemMatch: {
                _id: categoryId,
                "subCategory": {
                    $elemMatch: {
                        _id: subCategoryId,
                        item: {
                            $elemMatch: {
                                name: formattedItemName
                            }
                        }
                    }
                }
            }
        }
    })
    .then(result => {
        // This will throw error if the record exists
        if(result) {
            const error = new Error("Item exists for the sub category under the category");
            error.statusCode = 409;
            throw error;
        }
        // This will add new item to the menu
        return Menu.findOneAndUpdate({
            restaurantId
        }, {
            $push: {
                "category.$[categoryElem].subCategory.$[subCategoryElem].item": {
                    name: formattedItemName,
                    description,
                    rate,
                    isVeg
                }
            }
        }, {
            new: true,
            arrayFilters: [
                {
                    "categoryElem._id": categoryId
                },
                {
                    "subCategoryElem._id": subCategoryId
                }
            ]
        })
    })
    .then(result => {
        res.status(200).json({
            message: "Item is successfully added to the list",
            result
        })
    })
    .catch(err => {
        if(!err.statusCode)
            err.statusCode = 500;
        next(err);
    })
}

module.exports.patchEditItem = (req, res, next) => {
    const {
        restaurantId,
        categoryId,
        subCategoryId,
        description,
        rate,
        isItemAvailable
    } = req.body;
    const { itemId } = req.params;
    // This will check whether item is present
    findItemById(itemId, subCategoryId, categoryId, restaurantId)
    .then(result => {
        // This will check whether item exist
        if(!result) {
            const error = new Error("Item is does not exist under the specified location");
            error.statusCode = 404;
            throw error;
        }
        // This will find the element and update
        return Menu.findOneAndUpdate({
            restaurantId
        }, {
            $set: {
                "category.$[categoryElem].subCategory.$[subCategoryElem].item.$[itemElem].description": description,
                "category.$[categoryElem].subCategory.$[subCategoryElem].item.$[itemElem].rate": rate,
                "category.$[categoryElem].subCategory.$[subCategoryElem].item.$[itemElem].isItemAvailable": isItemAvailable
            }
        }, {
            new: true,
            arrayFilters: [
                {
                    "categoryElem._id": categoryId 
                }, {
                    "subCategoryElem._id": subCategoryId
                }, {
                    "itemElem._id": itemId
                }
            ]
        })
    })
    
    .then(result => {
        res.status(200).json({
            message: "Item is created successfully",
            result
        })
    })
    .catch(err => {
        if(!err.statusCode) 
            err.statusCode = 500;
        next(err);
    })
}

module.exports.patchDeleteItem = (req, res, next) => {
    const { itemId } = req.params;
    const { restaurantId, categoryId, subCategoryId } = req.body;
    findItemById(itemId, subCategoryId, categoryId, restaurantId)
    .then(result => {
        if(!result) {
            const error = new Error("Item is does not exist under the specified location");
            error.statusCode = 404;
            throw error;
        }
        console.log(result)
        return Menu.findOneAndUpdate({
            restaurantId
        }, {
            $pull: {
                "category.$[categoryElem].subCategory.$[subCategoryElem].item": {
                    _id: itemId
                }
            }
        }, {
            new: true,
            arrayFilters: [
                {
                    "categoryElem._id": categoryId 
                }, {
                    "subCategoryElem._id": subCategoryId
                }
            ]
        })
    })
    .then(result => {
        res.status(200).json({
            message: "Item is removed successfully",
            result
        })
    })
    .catch(err => {
        if(!err.statusCode) 
            err.statusCode = 500;
        next(err);
    })
}

