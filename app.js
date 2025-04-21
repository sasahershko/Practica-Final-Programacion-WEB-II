const express = require('express');
const cors = require('cors');
require('dotenv').config();

//slack
const morganBody = require('morgan-body');
const loggerStream = require('./utils/handleLogger');

//INDEX.JS
const router = require('./routes/index')

const dbConnect = require('./config/mongodb');
dbConnect();

const app = express();
morganBody(app, {
    noColors: true,
    skip: function(req, res){
        return res.statusCode >= 500
    },
    stream: loggerStream
});
app.use(cors());
app.use(express.json());

app.use('/api', router);

module.exports = app;