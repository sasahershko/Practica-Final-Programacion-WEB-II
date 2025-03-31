const express = require('express');
const cors = require('cors');
require('dotenv').config();

//INDEX.JS
const router = require('./routes/index')


const dbConnect = require('./config/mongodb');
dbConnect();

const app = express();
app.use(cors());
app.use(express.json()); 

app.use('/api', router);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log('Servidor escuchando en el puerto ' , port);  
});


