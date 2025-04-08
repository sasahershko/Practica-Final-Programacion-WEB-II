const mongoose = require('mongoose');
const { Schema } = mongoose;

const addressSchema = new Schema({
  street: String,
  number: Number,
  postal: Number,
  city: String,
  province: String
}, { _id: false }); 

const clientSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  name: {
    type: String,
    required: true
  },
  cif: {
    type: String,
    required: true
  },
  logo: {
    type: String
  },
  address: addressSchema,
  // Campo para soft-delete:
  archived: {
    type: Boolean,
    default: false
  }

  //* además añadir activeProjects y pendingDeliveryNotes
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
