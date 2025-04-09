const mongoose = require('mongoose');

const dbConnection = async() =>{
    const db_uri = process.env.DB_URI_TEST;

    mongoose.set('strictQuery', false); //para que no salga el warning de que se va a quitar en la siguiente versión

    try {
        // console.log('conectando')
        mongoose.connect(db_uri);
    } catch (e) {
        console.error('Error de conexión a la base de datos', e);
    }

    mongoose.connection.on("connected", () => console.log("Conectado a la BD"))
}


module.exports = dbConnection;