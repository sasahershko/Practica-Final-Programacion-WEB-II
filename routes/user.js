const express = require('express');
const router = express.Router();
const {validatorPersonalData, validatorCompanyData} = require('../validators/user');
const {patchUserRegister, patchUserCompany, updateUserLogo, getUser, deleteUser, requestPasswordReset,verifyResetCode, resetPassword, inviteUser } = require('../controllers/user');
//LOGO
const { uploadMiddlewareMemory} = require('../utils/handleStorage');

//MIDDLEWARES
const {checkRole} = require('../middleware/role');
const {authMiddleware} = require('../middleware/session');

router.get('/', authMiddleware, getUser);
router.delete('/', authMiddleware, deleteUser);
router.patch('/register', authMiddleware, validatorPersonalData, patchUserRegister);
router.patch('/company', authMiddleware, validatorCompanyData, patchUserCompany );
router.patch('/logo', authMiddleware, uploadMiddlewareMemory.single('image'), updateUserLogo); //! no en testing

//enviamos codigo
router.post('/recover', requestPasswordReset);
//vaslidamos código
router.put('/validation', verifyResetCode);
//cambiar contra
router.patch('/password', authMiddleware, resetPassword); //! no en testing

//invitar a un usuario
router.post('/invite', authMiddleware, checkRole(['user']), inviteUser);

module.exports = router;