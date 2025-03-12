const mongoose = require('mongoose');

//email, contraseña, rol, estado, nº intentos, código 

const UserScheme = new mongoose.Schema({
    email:{
        type: String,
        unique: true
    },
    password:{
        type: String
    },
    role:{
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    state:{
        type: String,
    },
    code:{
        type: Number
    },
    tries:{
        type: Number,
    }

},
{
    timestamps: true,
    versionKey: false
});


module.exports = mongoose.model('users', UserScheme);