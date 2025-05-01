const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../middleware/session');
const { validatorVerifyEmail, validatorAuth } = require('../validators/auth');
const { register, login, verifyEmail } = require('../controllers/auth');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user with email and password, and sends a verification code to their email.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: sasa@email.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SasaPass123
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             example:
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               user:
 *                 _id: 661ebc5dc8b4f823cdcf4aa7
 *                 email: sasa@email.com
 *                 role: user
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             example:
 *               error: Correo ya registrado
 *       500:
 *         description: Internal server error
 */
router.post('/register', validatorAuth, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user and returns a token and minimal user data.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: sasa@email.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SasaPass123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               user:
 *                 _id: 661ebc5dc8b4f823cdcf4aa7
 *                 email: sasa@email.com
 *                 role: user
 *       401:
 *         description: Invalid password
 *         content:
 *           application/json:
 *             example:
 *               error: Contraseña inválida
 *       403:
 *         description: User inactive
 *         content:
 *           application/json:
 *             example:
 *               error: Usuario desactivado
 *       409:
 *         description: Account not verified
 *         content:
 *           application/json:
 *             example:
 *               error: La cuenta no está verificada.
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               error: Usuario no encontrado
 *       500:
 *         description: Internal server error
 */
router.post('/login', validatorAuth, login);

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify user's email
 *     description: Verifies the email of the authenticated user by checking the 6-digit code.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Email verificado con éxito
 *               user:
 *                 email: sasa@email.com
 *                 role: user
 *       400:
 *         description: Invalid code or no attempts left
 *         content:
 *           application/json:
 *             example:
 *               error: Código inválido
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/verify-email', authMiddleware, validatorVerifyEmail, verifyEmail);

module.exports = router;