const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorGetItem = [
    check('id').exists().notEmpty().isMongoId(),
    (req, res, next) => {
        return validateResults(req, res, next)
    }
]


const validatorCreateItem = [
    check('email').exists().notEmpty().withMessage('No mail'),
    check('password').exists().notEmpty().withMessage('No password'),
    check('role').exists().notEmpty(),
    validateResults
]

module.exports = { validatorCreateItem, validatorGetItem }
