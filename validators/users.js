const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorGetItem = [
    check('id').exists().notEmpty().isMongoId(),
    (req, res, next) => {
        return validateResults(req, res, next)
    }
]

const validatorCreateItem = [
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
        .isLength({ min:8 }).withMessage('La contraseña debe tener mínimo 8 caracteres'),    
        // check('role').exists().notEmpty(),
    validateResults
]




module.exports = { validatorCreateItem, validatorGetItem }
