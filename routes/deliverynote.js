const express = require('express');
const router = express.Router();
const {
  createDeliveryNote,
  getAllDeliveryNotes,
  getDeliveryNote,
  deleteDeliveryNote
} = require('../controllers/deliveryNote');
const { createDeliveryNoteValidator } = require('../validators/deliveryNote');
const { authMiddleware } = require('../middleware/session');

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

//TODO crear y descargar el albarán en pdf


//TODO firmar albarán


// borrar albarán
router.delete('/:id', deleteDeliveryNote);

module.exports = router;
