const User = require('../models/User');
const jwt = require("jsonwebtoken");

exports.isAuth = (req, res, next) => {
    try {
        const [ bearer ,token ] = req.get("Authorization").split(" ");
        const user = jwt.verify(token, 'secert');
        if(!user) {
            const err = new Error("Not Authorized");
            err.statusCode = 401;
            throw err;
        }
        req.userId = user.userId;
        next();
    } catch(err) {
        const error = new Error("Not Authorized");
        error.statusCode = 401;
        next(error);
    }
}
