const deliveryNotesModel = require('../models/deliveryNote'); //? por qué no me funciona con /models?
const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleHttpError');


const createDeliveryNote = async (req, res) => {
  try {
    const user = req.user; 
    const data = matchedData(req); 

    const newNote = await deliveryNotesModel.create({
      userId: user._id,
      ...data
    });

    return res.status(201).json({
      message: 'Albarán creado con éxito',
      deliveryNote: newNote
    });
  } catch (error) {
    console.error(error);
    return handleHttpError(res, 'ERROR_CREATE_DELIVERY_NOTE', 500);
  }
};


const getAllDeliveryNotes = async (req, res) => {
  try {
    const user = req.user;

    const notes = await deliveryNotesModel.find({ userId: user._id })
      .populate('clientId', 'name cif')
      .populate('projectId', 'name code');

    return res.status(200).json({ deliveryNotes: notes });
  } catch (error) {
    console.error(error);
    return handleHttpError(res, 'ERROR_GET_ALL_DELIVERY_NOTES', 500);
  }
};


const getDeliveryNote = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const note = await deliveryNotesModel.findOne({
      _id: id,
      userId: user._id
    })
    .populate('userId', 'email role') //? he escogido estos campos, pero pueden ser otros
    .populate('clientId', 'name cif address')
    .populate('projectId', 'name code projectCode');

    if (!note) {
      return res.status(404).json({ message: 'Albarán no encontrado' });
    }

    return res.status(200).json({ deliveryNote: note });
  } catch (error) {
    console.error(error);
    return handleHttpError(res, 'ERROR_GET_DELIVERY_NOTE', 500);
  }
};

//TODO FALTA GENERAR/DESCARGAR PDF

//TODO FALTA FIRMAR DELIVERYNOTE


// borrar albarán
//? también hay hard/soft delete?
const deleteDeliveryNote = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const note = await deliveryNotesModel.findOne({
      _id: id,
      userId: user._id
    });
    if (!note) {
      return res.status(404).json({ message: 'Albarán no encontrado' });
    }

    // Si ya está firmado, no lo borramos
    if (note.sign) {
      return res.status(400).json({ message: 'No se puede borrar un albarán firmado' });
    }

    // Borrado físico (hard delete)
    await deliveryNotesModel.deleteOne({ _id: id });

    return res.status(200).json({
      message: 'Albarán eliminado con éxito'
    });
  } catch (error) {
    console.error(error);
    return handleHttpError(res, 'ERROR_DELETE_DELIVERY_NOTE', 500);
  }
};

module.exports = {
  createDeliveryNote,
  getAllDeliveryNotes,
  getDeliveryNote,
  deleteDeliveryNote
};
