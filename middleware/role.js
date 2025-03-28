const { handleHttpError } = require('../utils/handleHttpError');

const checkRole = (roles) => (req, res, next) => {
    try {
        const userRole = req.user.role;

        if (roles.includes(userRole)) {
            next();
        } else {
            res.status(403).send({ error: 'NOT_ALLOWED' }); 
        }
    } catch (error) {
        console.log('ERROR: ', error.message);
        handleHttpError(res, 'ERROR_PERMISSIONS');
    }
};

module.exports = { checkRole };
