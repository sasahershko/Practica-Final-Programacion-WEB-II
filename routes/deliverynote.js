const express = require('express');
const router = express.Router();
const {
  createDeliveryNote,
  getAllDeliveryNotes,
  getDeliveryNote,
  deleteDeliveryNote,
  getDeliveryNotePdf,    
  signDeliveryNote, 
} = require('../controllers/deliveryNote');
const { createDeliveryNoteValidator } = require('../validators/deliveryNote');
const { authMiddleware } = require('../middleware/session');
const { uploadMiddlewareMemory} = require('../utils/handleStorage');

router.use(authMiddleware);

// crear albarán
//* mirar bien por el tema de: (creo que lo hago ya, pero no estoy segura)
//*- El albarán creado podrá ser simple (una entrada para las horas realizadas por una persona o un material)
//*- El albarán creado podrá contener múltiple personas/horar y materiales
router.post('/', createDeliveryNoteValidator, createDeliveryNote);

// listar albaranes
router.get('/', getAllDeliveryNotes);

//mostrar un albarán
router.get('/:id', getDeliveryNote);

// crear y descargar el albarán en pdf
router.get('/pdf/:id', getDeliveryNotePdf);

// firmar albarán (y opcionalmente)
router.post('/:id/sign', uploadMiddlewareMemory.single('signature'), signDeliveryNote);

// borrar albarán
router.delete('/:id', deleteDeliveryNote);

module.exports = router;
