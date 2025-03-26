const express = require('express');
const router = express.Router();
const {validatorPersonalData, validatorCompanyData} = require('../validators/user');
const {putUserRegister, patchUserCompany, updateUserLogo, getUser, deleteUser } = require('../controllers/user');
//LOGO
const { uploadMiddlewareMemory} = require('../utils/handleStorage');

//MIDDLEWARES
const {checkRole} = require('../middleware/role');
const {authMiddleware} = require('../middleware/session');

router.get('/', authMiddleware, getUser); 
router.delete('/', authMiddleware, deleteUser); 
router.patch('/register', authMiddleware, validatorPersonalData, putUserRegister);
router.patch('/company', authMiddleware, validatorCompanyData, patchUserCompany );
router.patch('/logo', authMiddleware, uploadMiddlewareMemory.single('image'), updateUserLogo);


module.exports = router;