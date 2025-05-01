const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');


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
    check('surnames')
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
    check('company.name')
        .exists().withMessage('El nombre de la empresa es requerido')
        .bail()
        .notEmpty().withMessage('El nombre de la empresa no puede estar vacío'),

    check('company.cif')
        .exists().withMessage('El CIF es requerido')
        .bail()
        .notEmpty().withMessage('El CIF no puede estar vacío')
        .bail()
        .matches(/^[A-Za-z]\d{8}$/).withMessage('Formato de CIF inválido (ej: B12345678)'),

    check('company.street')
        .exists().withMessage('La dirección es requerida')
        .bail()
        .notEmpty().withMessage('La dirección no puede estar vacía'),

    check('company.number')
        .exists().withMessage('El número es requerido')
        .bail()
        .isNumeric().withMessage('El número debe ser un valor numérico'),

    check('company.postal')
        .exists().withMessage('El código postal es requerido')
        .bail()
        .isNumeric().withMessage('El código postal debe ser numérico')
        .bail()
        .matches(/^\d{5}$/).withMessage('El código postal debe tener 5 cifras'),

    check('company.city')
        .exists().withMessage('La ciudad es requerida')
        .bail()
        .notEmpty().withMessage('La ciudad no puede estar vacía'),

    check('company.province')
        .exists().withMessage('La provincia es requerida')
        .bail()
        .notEmpty().withMessage('La provincia no puede estar vacía'),

    validateResults
];


module.exports = { validatorPersonalData, validatorCompanyData }
