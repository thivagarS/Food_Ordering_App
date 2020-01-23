const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 8080;

// Express middlewares
// To parse JSON body data
app.use(bodyParser.json());

app.get('/', (req, res, next) => {
    res.send("Hello world");
});

app.listen(PORT, () => {
    console.log(`Application Started running on port ${PORT} ...`);
})