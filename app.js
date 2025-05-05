const express = require('express');
const cors = require('cors');
require('dotenv').config();

//swagger
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./docs/swagger");

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
        return res.statusCode < 500
    },
    stream: loggerStream
});
app.use(cors());
app.use(express.json());

//swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use('/api', router);

module.exports = app;