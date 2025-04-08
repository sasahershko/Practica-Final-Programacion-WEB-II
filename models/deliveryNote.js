const mongoose = require('mongoose');
const { Schema } = mongoose;

//subdocumento para cada linea del albarán:
const lineSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['hours', 'materials'], 
      required: true
    },
    description: {
      type: String
    },
    quantity: {
      type: Number,
      default: 1
    }
    // podría añadir más campos, ej. precio unitario, usuario que trabajó esas horas, etc??
  },
  { _id: false }
);

const deliveryNoteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true
    },
    lines: [lineSchema],
    // campos relacionados con la firma
    signed: {
      type: Boolean,
      default: false
    },
    signatureUrl: {
      type: String // URL a la firma en IPFS 
    },
    pdfUrl: {
      type: String // URL al PDF en la nube
    },
    // Soft delete:
    archived: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DeliveryNote', deliveryNoteSchema);
