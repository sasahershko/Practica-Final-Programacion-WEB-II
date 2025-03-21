const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorGetItem = [
    check('id').exists().notEmpty().isMongoId(),
    validateResults
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
        .isLength({ min: 8 }).withMessage('La contraseña debe tener mínimo 8 caracteres'),
    // check('role').exists().notEmpty(),
    validateResults
]

const validatorPersonalData = [
    check('email')
        .exists().withMessage('Email es requerido')
        .bail()
        .notEmpty().withMessage('Email no puede estar vacío')
        .bail()
        .isEmail().withMessage('Formato de email inválido'),
    check('name')
        .exists().withMessage('El nombre es requerido')
        .bail()
        .notEmpty().withMessage('El nombre no puede estar vacío'),
    check('usernames')
        .exists().withMessage('El apellido es requerido')
        .bail()
        .notEmpty().withMessage('El apellido no puede estar vacío'),
    check('nif')
        .exists().withMessage('El NIF es requerido')
        .bail()
        .notEmpty().withMessage('El NIF no puede estar vacío'),

    validateResults
]

const validatorCompanyData = [
    check('company').exists().withMessage('La compañía es requerida'),
    check('company.name').optional().notEmpty(),
    check('company.cif').optional().notEmpty(),
    check('company.street').optional().notEmpty(),
    check('company.number').optional().isNumeric(),
    check('company.postal').optional().isNumeric(),
    check('company.city').optional().notEmpty(),
    check('company.province').optional().notEmpty(),
    validateResults
]


module.exports = { validatorCreateItem, validatorGetItem, validatorPersonalData, validatorCompanyData }
