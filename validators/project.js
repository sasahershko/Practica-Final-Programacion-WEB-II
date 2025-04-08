const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const createProjectValidator = [
  check('name')
    .exists().withMessage('El nombre del proyecto es requerido')
    .bail()
    .notEmpty().withMessage('El nombre no puede estar vacío'),
  check('clientId')
    .exists().withMessage('El clientId es requerido')
    .bail()
    .notEmpty().withMessage('El clientId no puede estar vacío')
    .bail()
    .isMongoId().withMessage('clientId debe ser un id de Mongo válido'),

  // campos opcionales
  check('projectCode').optional().notEmpty().withMessage('projectCode no puede ser vacío si se incluye'),
  check('code').optional().notEmpty().withMessage('code no puede ser vacío si se incluye'),

  // dirección (address)
  check('address.street')
    .optional()
    .notEmpty().withMessage('La calle (street) no puede estar vacía si la incluyes'),
  check('address.number')
    .optional()
    .isNumeric().withMessage('El número de la dirección debe ser un valor numérico'),
  check('address.postal')
    .optional()
    .isNumeric().withMessage('El código postal debe ser un valor numérico'),
  check('address.city')
    .optional()
    .notEmpty().withMessage('La ciudad no puede estar vacía'),
  check('address.province')
    .optional()
    .notEmpty().withMessage('La provincia no puede estar vacía'),

  // fechas (begin y end)
  check('begin')
    .optional()
    .notEmpty().withMessage('La fecha de inicio no puede estar vacía si se incluye'),
  check('end')
    .optional()
    .notEmpty().withMessage('La fecha de fin no puede estar vacía si se incluye'),

  // notas
  check('notes').optional(),

  //? no sé si ponerlo??
  check('servicePrices')
    .optional()
    .isArray().withMessage('servicePrices debe ser un array'),
  check('servicePrices.*.serviceName')
    .optional()
    .notEmpty().withMessage('serviceName no puede estar vacío'),
  check('servicePrices.*.unitPrice')
    .optional()
    .isNumeric().withMessage('unitPrice debe ser numérico'),
    validateResults
];


const updateProjectValidator = [
  check('name')
    .exists().withMessage('El nombre del proyecto es requerido')
    .bail()
    .notEmpty().withMessage('El nombre no puede estar vacío'),

  check('clientId')
    .optional()
    .notEmpty().withMessage('clientId no puede estar vacío si se incluye')
    .bail()
    .isMongoId().withMessage('clientId debe ser un id de Mongo válido'),
  
  // Resto de campos opcionales
  check('projectCode').optional().notEmpty().withMessage('projectCode no puede ser vacío si se incluye'),
  check('code').optional().notEmpty().withMessage('code no puede estar vacío si se incluye'),

  check('address.street')
    .optional()
    .notEmpty().withMessage('La calle no puede estar vacía'),
  check('address.number')
    .optional()
    .isNumeric().withMessage('El número debe ser numérico'),
  check('address.postal')
    .optional()
    .isNumeric().withMessage('El postal debe ser numérico'),
  check('address.city')
    .optional()
    .notEmpty().withMessage('La ciudad no puede estar vacía'),
  check('address.province')
    .optional()
    .notEmpty().withMessage('La provincia no puede estar vacía'),

  check('begin')
    .optional()
    .notEmpty().withMessage('La fecha de inicio no puede estar vacía'),
  check('end')
    .optional()
    .notEmpty().withMessage('La fecha de fin no puede estar vacía'),

  check('notes').optional(),

  check('servicePrices')
    .optional()
    .isArray().withMessage('servicePrices debe ser un array'),
  check('servicePrices.*.serviceName')
    .optional()
    .notEmpty().withMessage('serviceName no puede estar vacío'),
  check('servicePrices.*.unitPrice')
    .optional()
    .isNumeric().withMessage('unitPrice debe ser numérico'),
    validateResults
];

module.exports = {
  createProjectValidator,
  updateProjectValidator
};
