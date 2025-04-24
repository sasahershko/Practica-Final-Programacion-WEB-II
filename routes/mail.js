const {validatorMail} = require('../validators/mail');
const {send} = require('../controllers/mail');
const {authMiddleware} = require('../middleware/session')

const express = require('express');
const router = express.Router();


/**
 * @swagger
 * /api/mail:
 *   post:
 *     summary: Send an email
 *     description: Sends an email using the provided subject, text, sender, and recipient. Requires authentication.
 *     tags: [Mail]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - text
 *               - to
 *               - from
 *             properties:
 *               subject:
 *                 type: string
 *                 example: "Consulta de soporte"
 *               text:
 *                 type: string
 *                 example: "Hola, necesito ayuda con mi cuenta."
 *               to:
 *                 type: string
 *                 example: "soporte@empresa.com"
 *               from:
 *                 type: string
 *                 example: "usuario@correo.com"
 *     responses:
 *       200:
 *         description: Email sent successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Correo enviado correctamente
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       500:
 *         description: Error sending email
 */
router.post('/', authMiddleware,validatorMail, send);


module.exports = router;