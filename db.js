const mongoose = require('mongoose');

const keys = require('./config/keys');

mongoose.connect(keys.mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
.then(res => {
    console.log('Connected to MongoDB...');
})
.catch(err => {
    console.log(err);
})