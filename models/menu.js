const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const menuSchema = new Schema({
    restaurantId: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant'
    },
    category: [
        {
            name: {
                type: String
            },
            subCategory: [
                {
                    name: {
                        type: String,
                        lowercase: true
                    },
                    item: [
                        {
                            name: {
                                type: String,
                                required: true
                            },
                            description: {
                                type: String,
                                required: true
                            },
                            rate: {
                                type: Number,
                                required: false
                            },
                            isVeg: {
                                type: Boolean,
                                required: true
                            },
                            isItemAvailable: {
                                type: Boolean,
                                default: false
                            }
                        }
                    ]
                }
            ]
        }
    ]
}, { timestamps: true});

const Menu = mongoose.model('Menu', menuSchema);
module.exports = Menu;