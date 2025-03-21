const mongoose = require('mongoose');

//email, contraseña, rol, estado, nº intentos, código 

const UserScheme = new mongoose.Schema({
    name: { type: String },
    surnames: { type: String },
    nif: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    state: { type: Boolean, default: false },
    code: { type: String },
    company: {
        name: { type: String, default: '' },
        cif: { type: String, default: '' },
        street: { type: String, default: '' },
        number: { type: Number, default: null },
        postal: { type: Number, default: null },
        city: { type: String, default: '' },
        province: { type: String, default: '' },
    }
},
    {
        timestamps: true,
        versionKey: false
    });


module.exports = mongoose.model('users', UserScheme);