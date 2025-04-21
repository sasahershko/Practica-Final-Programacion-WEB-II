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
