const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');


const validatorPersonalData = [
    check('email')
        .optional()
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
      .if((value, { req }) => !req.user?.isFreelancer)
      .exists().withMessage('El nombre de la empresa es requerido')
      .bail()
      .notEmpty().withMessage('El nombre de la empresa no puede estar vacío'),
  
    check('company.cif')
      .if((value, { req }) => !req.user?.isFreelancer)
      .exists().withMessage('El CIF es requerido')
      .bail()
      .notEmpty().withMessage('El CIF no puede estar vacío')
      .bail()
      .matches(/^[A-Za-z]\d{8}$/).withMessage('Formato de CIF inválido (ej: B12345678)'),
  
    check('company.street')
      .if((value, { req }) => !req.user?.isFreelancer)
      .exists().withMessage('La dirección es requerida')
      .bail()
      .notEmpty().withMessage('La dirección no puede estar vacía'),
  
    check('company.number')
      .if((value, { req }) => !req.user?.isFreelancer)
      .exists().withMessage('El número es requerido')
      .bail()
      .isNumeric().withMessage('El número debe ser un valor numérico'),
  
    check('company.postal')
      .if((value, { req }) => !req.user?.isFreelancer)
      .exists().withMessage('El código postal es requerido')
      .bail()
      .isNumeric().withMessage('El código postal debe ser numérico')
      .bail()
      .matches(/^\d{5}$/).withMessage('El código postal debe tener 5 cifras'),
  
    check('company.city')
      .if((value, { req }) => !req.user?.isFreelancer)
      .exists().withMessage('La ciudad es requerida')
      .bail()
      .notEmpty().withMessage('La ciudad no puede estar vacía'),
  
    check('company.province')
      .if((value, { req }) => !req.user?.isFreelancer)
      .exists().withMessage('La provincia es requerida')
      .bail()
      .notEmpty().withMessage('La provincia no puede estar vacía'),
  
    validateResults
  ];


const validatorAddress = [
    check('address.street')
        .exists().withMessage('La calle es requerida')
        .bail()
        .notEmpty().withMessage('La calle no puede estar vacía'),

    check('address.number')
        .exists().withMessage('El número es requerido')
        .bail()
        .isNumeric().withMessage('El número debe ser numérico'),

    check('address.postal')
        .exists().withMessage('El código postal es requerido')
        .bail()
        .matches(/^\d{5}$/).withMessage('El código postal debe tener 5 cifras'),

    check('address.city')
        .exists().withMessage('La ciudad es requerida')
        .bail()
        .notEmpty().withMessage('La ciudad no puede estar vacía'),

    check('address.province')
        .exists().withMessage('La provincia es requerida')
        .bail()
        .notEmpty().withMessage('La provincia no puede estar vacía'),

    validateResults
];

module.exports = { validatorPersonalData, validatorCompanyData, validatorAddress }
