const express = require('express');
const cors = require('cors');
require('dotenv').config();

//INDEX.JS
const router = require('./routes/index')


const dbConnect = require('./config/mongodb');
dbConnect();

const app = express();
// le decimos a la app  de express() que use cors para evitar el error Cross-Domain (XD)
app.use(cors());
app.use(express.json()); //para poder utilizar directamente el req.body en formato json

app.use('/api', router);

//PARA EL STORAGE
// app.use(express.static('storage')); // publicame esta carpeta para que sea accesible desde el navegador

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log('Servidor escuchando en el puerto ' , port);  
});


