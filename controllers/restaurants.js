const crypto = require('crypto');

const Restaurant = require('../models/restaurants');
const Menu = require('../models/menu');

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
        itemId,
        description,
        rate,
        isItemAvailable
    } = req.body;
    // This will check whether item is present
    Menu.findOne({
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
    .then(result => {
        // This will check whether item exist
        if(!result) {
            console.log("Inside error block");
            console.log(result)
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


