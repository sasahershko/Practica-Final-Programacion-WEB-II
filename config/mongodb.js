const mongoose = require('mongoose');

const dbConnection = async() =>{

    const db_uri = process.env.NODE_ENV === 'test' ? process.env.DB_URI_TEST : process.env.DB_URI;

    mongoose.set('strictQuery', false); //para que no salga el warning de que se va a quitar en la siguiente versión

    try {
        // console.log('conectando')
        mongoose.connect(db_uri);
    } catch (e) {
        console.error('Error de conexión a la base de datos', e);
    }

    mongoose.connection.on("connected", () => {
        if (process.env.NODE_ENV !== 'test') {
            console.log("Conectado a la BD")
        }
    });
}


module.exports = dbConnection;