const { check } = require('express-validator');
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
    .isIn(['hours', 'materials']).withMessage('format debe ser "hours" o "materials"'),

  //? por ejemplo: si "hours" es obligatorio solo si format === 'hours', lo haríamos con lógica adicional
  // aquí lo dejamos opcional
  check('hours')
    .optional()
    .isNumeric().withMessage('El campo hours debe ser numérico'),

  check('description')
    .optional()
    .isString().withMessage('description debe ser texto'),

  check('sign')
    .optional()
    .isString().withMessage('sign debe ser una cadena'),

  check('pending')
    .optional()
    .isBoolean().withMessage('pending debe ser boolean'),

  check('name')
    .optional()
    .isString().withMessage('name debe ser texto'),

  check('date')
    .optional()
    .isISO8601().withMessage('date debe tener un formato de fecha válido (ISO 8601)'),

  check('workers')
    .optional()
    .isArray().withMessage('workers debe ser un array de strings'),

    validateResults
];

module.exports = {
  createDeliveryNoteValidator
};
