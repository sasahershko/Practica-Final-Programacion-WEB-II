const express = require('express');
const router = express.Router();
const {validatorCreateItem, validatorGetItem, validatorPersonalData, validatorCompanyData} = require('../validators/users');
const {getUsers, getUser, createUser, updateUser, deleteUser, updateRole, putUserRegister, patchUserCompany } = require('../controllers/users');

const {checkRole} = require('../middleware/role');
const {authMiddleware} = require('../middleware/session');

// router.get('/', getUsers);
// router.get('/:id', validatorGetItem, getUser);
// router.post('/',validatorCreateItem, createUser);
// router.put('/:id', authMiddleware, updateUser);
// router.put('/role/:id', authMiddleware, checkRole(['admin']), updateRole);
// router.delete('/:id', deleteUser);

router.put('/register', authMiddleware, validatorPersonalData, putUserRegister);
router.patch('/company', authMiddleware, validatorCompanyData, patchUserCompany );


module.exports = router;