const {validationResult} = require('express-validator');

const validateResults = (req, res, next) =>{
    try {
        validationResult(req).throw();
        next();
    } catch (error) {
        res.status(422);
        res.send({ errors: error.array()});
    }
}

module.exports = validateResults;