const express = require('express');
const router = express.Router();
const {
  createDeliveryNote,
  getAllDeliveryNotes,
  getDeliveryNote,
  deleteDeliveryNote,
  getDeliveryNotePdf,    
  signDeliveryNote, 
} = require('../controllers/deliveryNote');
const { createDeliveryNoteValidator } = require('../validators/deliveryNote');
const { authMiddleware } = require('../middleware/session');
const { uploadMiddlewareMemory} = require('../utils/handleStorage');

router.use(authMiddleware);

// crear albarán
/**
 * @swagger
 * /api/deliverynote:
 *   post:
 *     summary: Create a delivery note
 *     description: Creates a new delivery note for the authenticated user. The format must be 'hours', 'materials', or 'both'. Required fields vary depending on the format.
 *     tags: [DeliveryNote]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [clientId, projectId, format]
 *             properties:
 *               clientId:
 *                 type: string
 *                 example: 661ebc5dc8b4f823cdcf4aa1
 *               projectId:
 *                 type: string
 *                 example: 661ebc5dc8b4f823cdcf4aa2
 *               format:
 *                 type: string
 *                 enum: [hours, materials, both]
 *                 example: hours
 *               description:
 *                 type: string
 *                 example: Reparación urgente de cableado
 *               workers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Juan Pérez
 *                     hours:
 *                       type: number
 *                       example: 6
 *               materials:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Tubo PVC
 *                     quantity:
 *                       type: number
 *                       example: 10
 *                     unit:
 *                       type: string
 *                       example: metros
 *     responses:
 *       201:
 *         description: Delivery note created successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Albarán creado con éxito
 *               deliveryNote:
 *                 _id: 661ebc5dc8b4f823cdcf4aa9
 *                 format: hours
 *                 workers:
 *                   - name: Juan Pérez
 *                     hours: 6
 *                 projectId: 661ebc5dc8b4f823cdcf4aa2
 *                 clientId: 661ebc5dc8b4f823cdcf4aa1
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', createDeliveryNoteValidator, createDeliveryNote);

// listar albaranes
/**
 * @swagger
 * /api/deliverynote:
 *   get:
 *     summary: Get all delivery notes of the authenticated user
 *     description: Returns a list of all delivery notes associated with the logged-in user. Includes populated info for client and project.
 *     tags: [DeliveryNote]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of delivery notes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deliveryNotes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DeliveryNote'
 *             examples:
 *               example1:
 *                 value:
 *                   deliveryNotes:
 *                     - _id: "661ebc5dc8b4f823cdcf4aa9"
 *                       format: "hours"
 *                       projectId:
 *                         _id: "661ebc5dc8b4f823cdcf4aa2"
 *                         name: "Instalación red"
 *                         code: "PROJ001"
 *                       clientId:
 *                         _id: "661ebc5dc8b4f823cdcf4aa1"
 *                         name: "SasaCorp"
 *                         cif: "B12345678"
 *                       description: "Montaje de red interna"
 *                       hours: 4
 *                       workers:
 *                         - name: "Pedro Ruiz"
 *                           hours: 4
 *                       pending: true
 *                       sign: ""
 *                       pdfUrl: ""
 *                       createdAt: "2024-04-01T10:00:00.000Z"
 *                       updatedAt: "2024-04-01T10:00:00.000Z"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllDeliveryNotes);

//mostrar un albarán
/**
 * @swagger
 * /api/deliverynote/{id}:
 *   get:
 *     summary: Get a delivery note by ID
 *     description: Returns the delivery note with populated user, client, and project details, if it belongs to the authenticated user.
 *     tags: [DeliveryNote]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Delivery note ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delivery note found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deliveryNote:
 *                   $ref: '#/components/schemas/DeliveryNote'
 *             examples:
 *               example1:
 *                 value:
 *                   deliveryNote:
 *                     _id: "661ebc5dc8b4f823cdcf4aa9"
 *                     format: "materials"
 *                     clientId:
 *                       _id: "661ebc5dc8b4f823cdcf4aa1"
 *                       name: "SasaCorp"
 *                       cif: "B12345678"
 *                       address:
 *                         street: "Calle Mayor"
 *                         number: 10
 *                         postal: 28001
 *                         city: "Madrid"
 *                         province: "Madrid"
 *                     projectId:
 *                       _id: "661ebc5dc8b4f823cdcf4aa2"
 *                       name: "Montaje eléctrico"
 *                       code: "ELEC-2025"
 *                     userId:
 *                       _id: "661ebc5dc8b4f823cdcf4a9a"
 *                       email: "sasa@email.com"
 *                       role: "user"
 *                     description: "Instalación de materiales eléctricos"
 *                     materials:
 *                       - name: "Cable coaxial"
 *                         quantity: 50
 *                         unit: "metros"
 *                     sign: ""
 *                     pdfUrl: ""
 *                     pending: true
 *       404:
 *         description: Delivery note not found
 *         content:
 *           application/json:
 *             example:
 *               message: Albarán no encontrado
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getDeliveryNote);

// crear y descargar el albarán en pdf
/**
 * @swagger
 * /api/deliverynote/pdf/{id}:
 *   get:
 *     summary: Generate or retrieve the PDF of a delivery note
 *     description: Returns the IPFS URL of the delivery note as a PDF. If the PDF has already been generated (and the note is signed), it returns the existing URL.
 *     tags: [DeliveryNote]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Delivery note ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF URL generated or retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: PDF generado correctamente y subido a IPFS
 *                 url:
 *                   type: string
 *                   example: https://gateway.pinata.cloud/ipfs/QmHashPDFExample
 *             examples:
 *               alreadyGenerated:
 *                 summary: Already generated
 *                 value:
 *                   message: PDF ya generado y disponible
 *                   url: https://gateway.pinata.cloud/ipfs/QmExistingHash
 *               newlyGenerated:
 *                 summary: Generated on the fly
 *                 value:
 *                   message: PDF generado correctamente y subido a IPFS
 *                   url: https://gateway.pinata.cloud/ipfs/QmNewHash
 *       404:
 *         description: Delivery note not found
 *         content:
 *           application/json:
 *             example:
 *               message: Albarán no encontrado
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/pdf/:id', getDeliveryNotePdf);

// firmar albarán (y opcionalmente)
/**
 * @swagger
 * /api/deliverynote/{id}/sign:
 *   post:
 *     summary: Sign a delivery note
 *     description: Signs a delivery note by uploading a signature image and generating a final PDF with it. Only unsigned delivery notes can be signed.
 *     tags: [DeliveryNote]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Delivery note ID to be signed
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               signature:
 *                 type: string
 *                 format: binary
 *                 description: Image of the signature (PNG, JPG)
 *     responses:
 *       200:
 *         description: Delivery note signed successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Albarán firmado con éxito
 *               sign: https://gateway.pinata.cloud/ipfs/QmSignatureHash
 *               pdfUrl: https://gateway.pinata.cloud/ipfs/QmPDFHash
 *       400:
 *         description: Missing signature or already signed
 *         content:
 *           application/json:
 *             examples:
 *               alreadySigned:
 *                 value:
 *                   message: El albarán ya está firmado
 *               noSignature:
 *                 value:
 *                   message: No se ha enviado ninguna firma
 *       404:
 *         description: Delivery note not found
 *         content:
 *           application/json:
 *             example:
 *               message: Albarán no encontrado
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/:id/sign', uploadMiddlewareMemory.single('signature'), signDeliveryNote);

// borrar albarán
/**
 * @swagger
 * /api/deliverynote/{id}:
 *   delete:
 *     summary: Delete a delivery note
 *     description: Deletes a delivery note if it has not been signed. Signed delivery notes cannot be deleted.
 *     tags: [DeliveryNote]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the delivery note to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delivery note deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Albarán eliminado con éxito
 *       400:
 *         description: Cannot delete signed delivery note
 *         content:
 *           application/json:
 *             example:
 *               message: No se puede borrar un albarán firmado
 *       404:
 *         description: Delivery note not found
 *         content:
 *           application/json:
 *             example:
 *               message: Albarán no encontrado
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', deleteDeliveryNote);

module.exports = router;
