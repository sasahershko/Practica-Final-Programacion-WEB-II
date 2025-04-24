const express = require('express');
const router = express.Router();
const {
  getAllClients,
  getArchivedClients,
  getClientById,
  createClient,
  updateClient,
  archiveClient,
  recoverClient,
  deleteClient
} = require('../controllers/client');

const { authMiddleware } = require('../middleware/session');
const { clientValidator } = require('../validators/client'); 

// get clients
/**
 * @swagger
 * /api/client:
 *   get:
 *     summary: Get all clients of the authenticated user
 *     description: Returns a list of all clients associated with the logged-in user. Requires a valid JWT token.
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with a list of clients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clients:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Client'
 *             examples:
 *               example1:
 *                 value:
 *                   clients:
 *                     - _id: "661ebc5dc8b4f823cdcf4aa7"
 *                       name: "Empresa S.A."
 *                       logo: ""
 *                       activeProjects: 2
 *                       pendingDeliveryNotes: 1
 *                       address:
 *                         street: "Calle Falsa 123"
 *                         number: 10
 *                         postal: 28080
 *                         city: "Madrid"
 *                         province: "Madrid"
 *                         cif: "B12345678"
 *                       userId: "661e88f5c8b4f823cdcf4a2b"
 *                       deleted: false
 *                       createdAt: "2024-01-01T00:00:00.000Z"
 *                       updatedAt: "2024-01-02T00:00:00.000Z"
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.get('/', authMiddleware, getAllClients); 

// add client
/**
 * @swagger
 * /api/client:
 *   post:
 *     summary: Add a new client for the authenticated user
 *     description: Creates a new client associated with the logged-in user. Requires a valid JWT token.
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientInput'
 *           examples:
 *             example1:
 *               value:
 *                 name: "Empresa S.A."
 *                 cif: "B12345678"
 *                 address:
 *                   street: "Calle Falsa 123"
 *                   number: 10
 *                   postal: 28080
 *                   city: "Madrid"
 *                   province: "Madrid"
 *     responses:
 *       201:
 *         description: Client created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cliente creado con éxito
 *                 client:
 *                   $ref: '#/components/schemas/Client'
 *       400:
 *         description: Validation error or client already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: El cliente ya existe
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.post('/', authMiddleware, clientValidator, createClient); 

// get archived clients of a user
/**
 * @swagger
 * /api/client/archive:
 *   get:
 *     summary: Get archived clients
 *     description: Returns a list of archived clients (archived = true) for the authenticated user. Requires a valid JWT token.
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of archived clients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 archivedClients:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Client'
 *             examples:
 *               example1:
 *                 value:
 *                   archivedClients:
 *                     - _id: "661ebc5dc8b4f823cdcf4aa7"
 *                       name: "Empresa Archivada"
 *                       logo: ""
 *                       activeProjects: 0
 *                       pendingDeliveryNotes: 0
 *                       address:
 *                         street: "Calle del Olvido"
 *                         number: 1
 *                         postal: 30000
 *                         city: "Valencia"
 *                         province: "Valencia"
 *                         cif: "B99999999"
 *                       userId: "661e88f5c8b4f823cdcf4a2b"
 *                       deleted: false
 *                       createdAt: "2023-11-01T00:00:00.000Z"
 *                       updatedAt: "2023-12-01T00:00:00.000Z"
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.get('/archive', authMiddleware, getArchivedClients);

// get client
/**
 * @swagger
 * /api/client/{id}:
 *   get:
 *     summary: Get a client by ID
 *     description: Returns a specific client by ID if it belongs to the authenticated user.
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the client
 *     responses:
 *       200:
 *         description: Client found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 client:
 *                   $ref: '#/components/schemas/Client'
 *             examples:
 *               example1:
 *                 value:
 *                   client:
 *                     _id: "661ebc5dc8b4f823cdcf4aa7"
 *                     name: "Empresa S.A."
 *                     logo: ""
 *                     activeProjects: 2
 *                     pendingDeliveryNotes: 1
 *                     address:
 *                       street: "Calle Falsa 123"
 *                       number: 10
 *                       postal: 28080
 *                       city: "Madrid"
 *                       province: "Madrid"
 *                       cif: "B12345678"
 *                     userId: "661e88f5c8b4f823cdcf4a2b"
 *                     deleted: false
 *                     createdAt: "2024-01-01T00:00:00.000Z"
 *                     updatedAt: "2024-01-02T00:00:00.000Z"
 *       400:
 *         description: Invalid ID format
 *         content:
 *           application/json:
 *             example:
 *               error: Formato de ID inválido
 *       404:
 *         description: Client not found
 *         content:
 *           application/json:
 *             example:
 *               message: Cliente no encontrado
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authMiddleware, getClientById); 

// update client
/**
 * @swagger
 * /api/client/{id}:
 *   patch:
 *     summary: Update a client
 *     description: Updates the information of a client belonging to the authenticated user.
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the client to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientInput'
 *           examples:
 *             example1:
 *               value:
 *                 name: "Empresa S.A. actualizada"
 *                 cif: "B87654321"
 *                 logo: "https://logo.com/actualizado.png"
 *                 address:
 *                   street: "Nueva Calle"
 *                   number: 99
 *                   postal: 28000
 *                   city: "Madrid"
 *                   province: "Madrid"
 *     responses:
 *       200:
 *         description: Client updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cliente actualizado con éxito
 *                 client:
 *                   $ref: '#/components/schemas/Client'
 *       400:
 *         description: Validation error or invalid ID
 *       404:
 *         description: Client not found
 *         content:
 *           application/json:
 *             example:
 *               message: Cliente no encontrado
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.patch('/:id', authMiddleware,clientValidator, updateClient); 

// delete client
/**
 * @swagger
 * /api/client/{id}:
 *   delete:
 *     summary: Permanently delete a client
 *     description: Deletes a client permanently from the database if it belongs to the authenticated user.
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the client to delete
 *     responses:
 *       200:
 *         description: Client deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cliente eliminado permanentemente
 *       404:
 *         description: Client not found
 *         content:
 *           application/json:
 *             example:
 *               message: Cliente no encontrado
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authMiddleware, deleteClient); 

//! upload logo and update its url


//archiving client
/**
 * @swagger
 * /api/client/archive/{id}:
 *   delete:
 *     summary: Archive a client (soft delete)
 *     description: Marks a client as archived (archived = true) instead of deleting it permanently. Only works if the client belongs to the authenticated user.
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the client to archive
 *     responses:
 *       200:
 *         description: Client archived successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cliente archivado
 *                 client:
 *                   $ref: '#/components/schemas/Client'
 *       404:
 *         description: Client not found
 *         content:
 *           application/json:
 *             example:
 *               message: Cliente no encontrado
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.delete('/archive/:id', authMiddleware, archiveClient); 

// restore an archived client
/**
 * @swagger
 * /api/client/recover/{id}:
 *   patch:
 *     summary: Recover (unarchive) a client
 *     description: "Restores a previously archived client by setting archived to false."
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the client to recover
 *     responses:
 *       200:
 *         description: Client successfully recovered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cliente restaurado (desarchivado)
 *                 client:
 *                   $ref: '#/components/schemas/Client'
 *       404:
 *         description: Client not found
 *         content:
 *           application/json:
 *             example:
 *               message: Cliente no encontrado
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.patch('/recover/:id', authMiddleware, recoverClient); 

module.exports = router;
