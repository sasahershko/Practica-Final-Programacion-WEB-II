const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const clientValidator = [
  check('name')
    .exists().withMessage('El nombre es requerido')
    .bail()
    .notEmpty().withMessage('El nombre no puede estar vacío'),
  check('cif')
    .exists().withMessage('El CIF es requerido')
    .bail()
    .notEmpty().withMessage('El CIF no puede estar vacío'),
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
    validateResults
];

module.exports = { clientValidator };
