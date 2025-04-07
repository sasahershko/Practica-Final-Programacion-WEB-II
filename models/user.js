const mongoose = require('mongoose');

//email, contraseña, rol, estado, nº intentos, código 

const UserScheme = new mongoose.Schema({
    name: { type: String, default: '' },
    surnames: { type: String, default: '' },
    nif: { type: String, default: ''  },
    email: { type: String, unique: true },
    password: { type: String },
    tries: { type: Number, default: 3 },
    role: { type: String, enum: ['admin', 'user', 'guest'], default: 'user' },
    verified: { type: Boolean, default: false },
    active: { type: Boolean, default: true}, //si se desactiva, estaría en soft delete
    code: { type: String },
    company: {
        name: { type: String, default: '' },
        cif: { type: String, default: '' },
        street: { type: String, default: '' },
        number: { type: Number, default: null },
        postal: { type: Number, default: null },
        city: { type: String, default: '' },
        province: { type: String, default: '' },
    },
    logo: {type: String, default: ''},
},
    {
        timestamps: true,
        versionKey: false
    });


module.exports = mongoose.model('users', UserScheme);