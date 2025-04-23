const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../middleware/session');
const { validatorRegister, validatorLogin, validatorVerifyEmail } = require('../validators/auth');
const { register, login, verifyEmail } = require('../controllers/auth');


router.post('/register', validatorRegister, register);
router.post('/login', validatorLogin, login);
router.post('/verify-email', authMiddleware, validatorVerifyEmail, verifyEmail);

module.exports = router;