const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");


const validatorRegister = [
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
    (req, res, next) => {
        delete req.body.verified; //(en caso de que alguien intentara forzar un state en el post para validar el mail)
        return validateResults(req, res, next)
    }
];

const validatorLogin = [
    check('email')
        .exists().withMessage('Email es requerido')
        .bail()
        .notEmpty().withMessage('Email no puede estar vacío')
        .bail()
        .isEmail().withMessage('Formato de email inválido'),
    check('password')
        .exists().withMessage('Contraseña requerida')
        .bail()
        .notEmpty().withMessage('Contraseña no puede estar vacía'),
        validateResults
];

const validatorVerifyEmail = [
    check('code')
      .exists().withMessage('El código es requerido')
      .bail()
      .notEmpty().withMessage('El código no puede estar vacío'),
    validateResults
  ]

module.exports = { validatorRegister, validatorLogin , validatorVerifyEmail}