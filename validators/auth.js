const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validatorAuth = [
  check('email')
    .exists().withMessage('Email es requerido')
    .bail()
    .notEmpty().withMessage('Email no puede estar vacío')
    .bail()
    .isEmail().withMessage('Formato de email inválido'),
  check('password')
    .exists().withMessage('Contraseña requerida')
    .bail()
    .notEmpty().withMessage('Contraseña no puede estar vacía')
    .bail()
    .isLength({ min: 8 }).withMessage('La contraseña debe tener mínimo 8 caracteres'),
  check('isFreelancer')
    .optional()
    .isBoolean().withMessage('isFreelancer debe ser booleano (true o false)'),
  validateResults
];

const validatorVerifyEmail = [
  check('code')
    .exists().withMessage('El código es requerido')
    .bail()
    .notEmpty().withMessage('El código no puede estar vacío'),
  validateResults
]

module.exports = { validatorAuth, validatorVerifyEmail }