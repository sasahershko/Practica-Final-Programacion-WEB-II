//! EN CASO DE QUE SE QUIERA GENERAR UN TOKEN TEMPORAL PARA LA CONTRASEÑA (+ SEGURIDAD)
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;


const verifyResetToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).send({ message: 'Token requerido' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.action !== 'reset_password') {
            return res.status(403).send({ message: 'Token no autorizado para esta acción' });
        }

        req.user = decoded; // contiene { id, action }
        next();
    } catch (error) {
        return res.status(401).send({ message: 'Token inválido o expirado' });
    }
};

module.exports = { verifyResetToken };