const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    name: { type: String, default: '' },
    cif: { type: String, default: '' },
    street: { type: String, default: '' },
    number: { type: Number, default: null },
    postal: { type: Number, default: null },
    city: { type: String, default: '' },
    province: { type: String, default: '' },
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('Company', CompanySchema);