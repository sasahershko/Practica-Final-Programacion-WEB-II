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

// get clients -> sigo los de swagger
router.get('/', authMiddleware, getAllClients); 

// add client
router.post('/', authMiddleware, clientValidator, createClient); 

// get archived clients of a user
router.get('/archive', authMiddleware, getArchivedClients);

// get client
router.get('/:id', authMiddleware, getClientById); 

// update client
router.patch('/:id', authMiddleware,clientValidator, updateClient); 

// delete client
router.delete('/:id', authMiddleware, deleteClient); 

//! upload logo and update its url


//archiving client
router.delete('/archive/:id', authMiddleware, archiveClient); 

// restore an archived client
router.patch('/recover/:id', authMiddleware, recoverClient); 

module.exports = router;
