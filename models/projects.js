const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  projectCode: { type: String, required: true },
  code: { type: String, required: true },
  notes: { type: String, default: '' },

  begin: { type: String }, // puedes usar Date si prefieres
  end: { type: String },

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'clients', required: true },

  address: {
    street: { type: String },
    number: { type: Number },
    postal: { type: Number },
    city: { type: String },
    province: { type: String }
  },

  deleted: { type: Boolean, default: false }, // para soft delete

}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('projects', ProjectSchema);
