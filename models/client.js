const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cif: { type: String },
  logo: { type: String, default: '' },

  activeProjects: { type: Number, default: 0 },
  pendingDeliveryNotes: { type: Number, default: 0 },

  address: {
    street: { type: String },
    number: { type: Number },
    postal: { type: Number },
    city: { type: String },
    province: { type: String }
  },

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  deleted: { type: Boolean, default: false }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('clients', ClientSchema);
