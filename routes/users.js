const express = require('express');
const router = express.Router();
const {validatorCreateItem, validatorGetItem} = require('../validators/users');
const {getUsers, createUser} = require('../controllers/users');

router.get('/', getUsers);
router.post('/', validatorCreateItem, createUser)

module.exports = router;