const {validatorMail} = require('../validators/mail');
const {send} = require('../controllers/mail');
const {authMiddleware} = require('../middleware/session')

const express = require('express');
const router = express.Router();

router.post('/', authMiddleware,validatorMail, send);


module.exports = router;