const mongoose = require('mongoose');

const DeliveryNoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'clients', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'projects', required: true },

  format: { type: String, enum: ['hours', 'materials'], required: true },
  hours: { type: Number, default: 0 }, // solo si es formato horas

  description: { type: String, default: '' },

  sign: { type: String, default: '' }, // firma (imagen o path IPFS/nube)
  pending: { type: Boolean, default: true },

  deleted: { type: Boolean, default: false }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('deliverynotes', DeliveryNoteSchema);
