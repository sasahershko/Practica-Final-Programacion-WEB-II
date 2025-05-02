const express = require('express');
const router = express.Router();
const {validatorPersonalData, validatorCompanyData, validatorAddress} = require('../validators/user');
const {patchUserRegister, patchUserCompany, patchUserAddress, updateUserLogo, getUser, deleteUser, requestPasswordReset,verifyResetCode, resetPassword, inviteUser } = require('../controllers/user');
//LOGO
const { uploadMiddlewareMemory} = require('../utils/handleStorage');

//MIDDLEWARES
const {checkRole} = require('../middleware/role');
const {authMiddleware} = require('../middleware/session');

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get current user
 *     description: Returns the authenticated user's profile information (excluding sensitive data like password).
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authenticated user's profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             examples:
 *               example1:
 *                 value:
 *                   user:
 *                     _id: "661ebc5dc8b4f823cdcf4aa7"
 *                     name: "Sasa"
 *                     surnames: "Lara"
 *                     nif: "12345678Z"
 *                     email: "sasa@empresa.com"
 *                     role: "user"
 *                     verified: true
 *                     active: true
 *                     company:
 *                       name: "U-tad"
 *                       cif: "B12345678"
 *                       street: "Av. Universidad"
 *                       number: 12
 *                       postal: 28223
 *                       city: "Madrid"
 *                       province: "Madrid"
 *                     logo: "https://gateway.pinata.cloud/ipfs/QmLogoHash"
 *                     createdAt: "2024-01-01T00:00:00.000Z"
 *                     updatedAt: "2024-01-10T00:00:00.000Z"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/', authMiddleware, getUser);


/**
 * @swagger
 * /api/user:
 *   delete:
 *     summary: Delete the authenticated user
 *     description: Performs a soft delete (sets active to false) by default. To perform a hard delete (permanent removal), add the query parameter `?soft=false`.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: soft
 *         required: false
 *         schema:
 *           type: string
 *         description: Set to false to perform hard delete (e.g., ?soft=false)
 *     responses:
 *       200:
 *         description: User deleted (soft or hard)
 *         content:
 *           application/json:
 *             examples:
 *               softDelete:
 *                 summary: Soft delete response
 *                 value:
 *                   message: Usuario desactivado (soft delete)
 *               hardDelete:
 *                 summary: Hard delete response
 *                 value:
 *                   message: Usuario eliminado permanentemente(hard delete)
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.delete('/', authMiddleware, deleteUser);

/**
 * @swagger
 * /api/user/register:
 *   patch:
 *     summary: Update personal data of the authenticated user
 *     description: Updates fields like name, surnames, nif, and email of the logged-in user.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, surnames, nif, email]
 *             properties:
 *               name:
 *                 type: string
 *                 example: sasa
 *               surnames:
 *                 type: string
 *                 example: Martínez Pérez
 *               nif:
 *                 type: string
 *                 example: 12345678Z
 *               email:
 *                 type: string
 *                 format: email
 *                 example: sasa@email.com
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario editado con éxito
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.patch('/register', authMiddleware, validatorPersonalData, patchUserRegister);

/**
 * @swagger
 * /api/user/address:
 *   patch:
 *     summary: Actualizar dirección del usuario
 *     description: Actualiza la dirección del usuario. Si el usuario es autónomo, todos los campos son obligatorios.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: object
 *                 required: [street, number, postal, city, province]
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: Calle Falsa
 *                   number:
 *                     type: integer
 *                     example: 123
 *                   postal:
 *                     type: integer
 *                     example: 28080
 *                   city:
 *                     type: string
 *                     example: Madrid
 *                   province:
 *                     type: string
 *                     example: Madrid
 *     responses:
 *       200:
 *         description: Dirección actualizada con éxito
 *         content:
 *           application/json:
 *             example:
 *               message: Dirección actualizada con éxito
 *               address:
 *                 street: Calle Falsa
 *                 number: 123
 *                 postal: 28080
 *                 city: Madrid
 *                 province: Madrid
 *       400:
 *         description: Error de validación
 *       401:
 *         description: Token inválido o no enviado
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/address', authMiddleware, validatorAddress, patchUserAddress);

/**
 * @swagger
 * /api/user/company:
 *   patch:
 *     summary: Actualizar los datos de la compañía del usuario
 *     description: >
 *       Si el usuario es autónomo (`isFreelancer: true`), **no es necesario enviar ningún dato**. 
 *       Se generará automáticamente una compañía usando su nombre, apellidos, NIF y dirección personal. 
 *       En ese caso, la dirección debe haberse completado previamente mediante `PATCH /api/user/address`.  
 *       
 *       Si el usuario **no es autónomo**, debe enviar todos los campos requeridos del objeto `company`.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company:
 *                 type: object
 *                 required:
 *                   - name
 *                   - cif
 *                   - street
 *                   - number
 *                   - postal
 *                   - city
 *                   - province
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: SasaTech S.L.
 *                   cif:
 *                     type: string
 *                     example: B12345678
 *                   street:
 *                     type: string
 *                     example: Calle Ejemplo
 *                   number:
 *                     type: integer
 *                     example: 42
 *                   postal:
 *                     type: integer
 *                     example: 28080
 *                   city:
 *                     type: string
 *                     example: Madrid
 *                   province:
 *                     type: string
 *                     example: Madrid
 *     responses:
 *       200:
 *         description: Compañía actualizada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Compañía actualizada con éxito
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Error de validación o falta de dirección personal en autónomos
 *         content:
 *           application/json:
 *             examples:
 *               freelancerMissingAddress:
 *                 summary: Autónomo sin dirección personal completa
 *                 value:
 *                   error: Faltan campos de dirección personal: street, city, ...
 *               invalidCompanyData:
 *                 summary: Empresa sin datos de compañía
 *                 value:
 *                   errors:
 *                     - msg: El nombre de la empresa es requerido
 *                       param: company.name
 *                       location: body
 *       401:
 *         description: Token inválido o no enviado
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/company', authMiddleware, validatorCompanyData, patchUserCompany );

/**
 * @swagger
 * /api/user/logo:
 *   patch:
 *     summary: Upload and update the user's logo
 *     description: Uploads an image to IPFS and updates the user's logo URL.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *     responses:
 *       200:
 *         description: Logo uploaded and user updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logo actualizado correctamente
 *                 logo:
 *                   type: string
 *                   example: https://gateway.pinata.cloud/ipfs/QmHashExample
 *       400:
 *         description: No image sent
 *         content:
 *           application/json:
 *             example:
 *               error: No se ha enviado ninguna imagen.
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Error uploading or updating logo
 */
router.patch('/logo', authMiddleware, uploadMiddlewareMemory.single('image'), updateUserLogo);

//enviamos código
/**
 * @swagger
 * /api/user/recover:
 *   post:
 *     summary: Send password recovery code to user's email
 *     description: Sends a 6-digit verification code to the email if the user exists.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: sasa@email.com
 *     responses:
 *       200:
 *         description: Recovery code sent successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Código enviado
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               error: Usuario no encontrado
 *       500:
 *         description: Error al generar código
 */
router.post('/recover', requestPasswordReset);

//validamos código
/**
 * @swagger
 * /api/user/validation:
 *   put:
 *     summary: Validate password recovery code
 *     description: Validates the code sent to the user's email and returns a token if correct.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email:
 *                 type: string
 *                 example: sasa@email.com
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Code verified successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Código verificado
 *               token: eyJhbGciOiJIUzI1NiIsInR...
 *       400:
 *         description: Incorrect code
 *         content:
 *           application/json:
 *             example:
 *               error: Código incorrecto
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/validation', verifyResetCode);


//cambiar contra
/**
 * @swagger
 * /api/user/password:
 *   patch:
 *     summary: Reset user password
 *     description: Changes the password of the authenticated user after code verification.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 example: NuevaContraseña123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Contraseña cambiada con éxito
 *       400:
 *         description: Password missing
 *         content:
 *           application/json:
 *             example:
 *               message: Contraseña requerida
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.patch('/password', authMiddleware, resetPassword);

//invitar a un usuario
/**
 * @swagger
 * /api/user/invite:
 *   post:
 *     summary: Invite another user to the same company
 *     description: Creates a new guest user or updates an existing one by assigning them the inviter's company.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: nuevo@empresa.com
 *     responses:
 *       201:
 *         description: New user created and invited
 *         content:
 *           application/json:
 *             example:
 *               message: Usuario creado e invitado con éxito
 *               user:
 *                 email: nuevo@empresa.com
 *                 role: guest
 *                 company:
 *                   name: SasaCorp
 *       200:
 *         description: Existing user invited
 *         content:
 *           application/json:
 *             example:
 *               message: Usuario invitado con éxito
 *               user:
 *                 email: nuevo@empresa.com
 *                 role: guest
 *                 company:
 *                   name: SasaCorp
 *       400:
 *         description: Cannot invite self or user already in a company
 *         content:
 *           application/json:
 *             example:
 *               error: No puedes invitarte a ti mismo
 *       500:
 *         description: Error al invitar al usuario
 */
router.post('/invite', authMiddleware, checkRole(['user']), inviteUser);

module.exports = router;