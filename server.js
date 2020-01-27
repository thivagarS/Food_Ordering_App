const express = require("express");
const bodyParser = require("body-parser");

// Restaurant Routes
const restaurantRoutes = require("./routes/restaurants");
require('./db');

const app = express();
const PORT = process.env.PORT || 8080;

// Express middlewares
// To parse JSON body data
app.use(bodyParser.json());

// Routes
app.use('/v1/restaurant', restaurantRoutes);

app.get('/', (req, res, next) => {
    res.send("Hello world");
});

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({ message: message });
});

app.listen(PORT, () => {
    console.log(`Application Started running on port ${PORT} ...`);
})