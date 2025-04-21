const { check, body } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const createDeliveryNoteValidator = [
  check('clientId')
    .exists().withMessage('El campo clientId es obligatorio')
    .bail()
    .notEmpty().withMessage('clientId no puede estar vacío')
    .bail()
    .isMongoId().withMessage('clientId debe ser un id de Mongo válido'),

  check('projectId')
    .exists().withMessage('El campo projectId es obligatorio')
    .bail()
    .notEmpty().withMessage('projectId no puede estar vacío')
    .bail()
    .isMongoId().withMessage('projectId debe ser un id de Mongo válido'),

  check('format')
    .exists().withMessage('El campo format es obligatorio')
    .bail()
    .isIn(['hours', 'materials', 'both']).withMessage('format debe ser "hours", "materials" o "both"'),

  check('description')
    .optional()
    .isString().withMessage('La descripcón debe ser texto'),

  check('sign')
    .optional()
    .isString().withMessage('La firma debe ser una cadena'),

  check('pending')
    .optional()
    .isBoolean().withMessage('"pending" debe ser un booleano'),

  check('name')
    .optional()
    .isString().withMessage('name debe ser texto'),

  check('date')
    .optional()
    .isISO8601().withMessage('La fecha debe tener un formato de fecha válido (ISO 8601)'),
    
  check('workers')
    .optional()
    .isArray().withMessage('workers debe ser un array'),

  check('materials')
    .optional()
    .isArray().withMessage('materials debe ser un array'),


  // según el formato
  body().custom((body) => {
    const { format, workers, materials } = body;

    if (format === 'hours' || format === 'both') {
      //debe haber al menos un trabajador
      if (!Array.isArray(workers) || workers.length === 0) {
        throw new Error('Debe incluir al menos un trabajador en workers');
      }
      //cada trabajador debe tener name y hours
      workers.forEach(w => {
        if (typeof w.name !== 'string' || typeof w.hours !== 'number') {
          throw new Error('Cada trabajador debe tener name (string) y hours (número)');
        }
      });
    }

    if (format === 'materials' || format === 'both') {
      if (!Array.isArray(materials) || materials.length === 0) {
        throw new Error('Debe incluir al menos un material en materials');
      }
      materials.forEach(m => {
        if (typeof m.name !== 'string' || typeof m.quantity !== 'number' || typeof m.unit !== 'string') {
          throw new Error('Cada material debe tener name (string), quantity (número) y unit (string)');
        }
      });
    }

    return true;
  }),

  validateResults
];

module.exports = {
  createDeliveryNoteValidator
};
