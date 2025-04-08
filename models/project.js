// /models/Project.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const addressSchema = new Schema(
  {
    street: { type: String, default: '' },
    number: { type: Number, default: 0 },
    postal: { type: Number, default: 0 },
    city: { type: String, default: '' },
    province: { type: String, default: '' }
  },
  { _id: false }
);

const servicePriceSchema = new Schema(
  {
    serviceName: { type: String },
    unitPrice: { type: Number, default: 0 }
  },
  { _id: false }
);

const projectSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users', 
      required: true
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client', 
      required: true
    },
    name: {
      type: String,
      required: true
    },
    projectCode: {
      type: String
    },
    code: {
      type: String
    },
    address: addressSchema,
    begin: {
      type: String // O Date??
    },
    end: {
      type: String // O Date??
    },
    notes: {
      type: String
    },
    servicePrices: [servicePriceSchema],
    archived: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
