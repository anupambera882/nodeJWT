const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const route = require('./routes/index');
const app = express();
const port = 3000;
const DB_URI = "mongodb+srv://anupambera882:anupambera882@anupam.vqwwh4s.mongodb.net/jwtDB?retryWrites=true&w=majority";

route(app);

mongoose.connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("DB is connected....");
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
}).catch((err) => console.log(err));