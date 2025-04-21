const mongoose = require('mongoose');
const { Schema } = mongoose;

const addressSchema = new Schema(
    {
        street: String,
        number: Number,
        postal: Number,
        city: String,
        province: String
    },
    { _id: false }
);


const companySchema = new Schema(
    {
        name: String,
        cif: String,
        street: String,
        number: Number,
        postal: Number,
        city: String,
        province: String
    },
    { _id: false }
);

// si se quisiera duplicar info completa
const embeddedClientSchema = new Schema(
    {
        name: String,
        cif: String,
        address: addressSchema
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
        clientId: {
            type: Schema.Types.ObjectId,
            ref: 'Client'
        },
        projectId: {
            type: Schema.Types.ObjectId,
            ref: 'Project'
        },

        company: companySchema,
        client: embeddedClientSchema,

        name: {
            type: String,
            default: ''
        },
        date: {
            type: Date,
            default: Date.now // o la fecha que se especifique
        },
        project: {
            type: String, 
            default: ''
        },
        description: {
            type: String,
            default: ''
        },

        format: {
            type: String,
            enum: ['hours', 'materials', 'both'],
            default: 'hours'
        },

        hours: {
            type: Number,
            default: 0
        },

        workers: [
            {
              name: String,
              hours: Number,
              _id: false
            }
          ],

          materials: [
            {
              name: String,
              quantity: Number,
              unit: String,
              _id: false
            }
          ],

        photo: {
            type: String
        },

        sign: {
            type: String, // URL de la firma
            default: ''
        },


        // para saber si está pendiente, firmado, etc
        pending: {
            type: Boolean,
            default: true
        },

        archived: {
            type: Boolean,
            default: false
        },

        // para guardar la url del pdf
        pdfUrl: {
            type: String,
            default: ''
          }
    },
    {
        timestamps: true 
    }
);

module.exports = mongoose.model('DeliveryNote', deliveryNoteSchema);
