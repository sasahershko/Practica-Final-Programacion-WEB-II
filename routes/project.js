const express = require('express');
const router = express.Router();
const {
    getAllProjects,
    getOneProject,
    getArchivedProjectsOfUser,
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
    recoverProject
} = require('../controllers/project');

const { authMiddleware } = require('../middleware/session');
const { createProjectValidator, updateProjectValidator, validatorIdParam  } = require('../validators/project')

// para que se utilice siempre el authMiddleware
router.use(authMiddleware);

// get all projects
/**
 * @swagger
 * /api/project:
 *   get:
 *     summary: Get all active projects of the authenticated user
 *     description: Returns a list of all non-archived projects associated with the logged-in user.
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projects:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllProjects);

// adding project
/**
 * @swagger
 * /api/project:
 *   post:
 *     summary: Create a new project
 *     description: Creates a new project for the authenticated user. The project must have a name and a valid client ID. Optional fields include address, projectCode, servicePrices, etc.
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, clientId]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Reforma Local Madrid
 *               clientId:
 *                 type: string
 *                 example: 661ebc5dc8b4f823cdcf4aa1
 *               projectCode:
 *                 type: string
 *                 example: REFORM-MAD-01
 *               code:
 *                 type: string
 *                 example: 2301-RM
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: Calle Mayor
 *                   number:
 *                     type: number
 *                     example: 15
 *                   postal:
 *                     type: number
 *                     example: 28080
 *                   city:
 *                     type: string
 *                     example: Madrid
 *                   province:
 *                     type: string
 *                     example: Madrid
 *               begin:
 *                 type: string
 *                 example: 2024-05-01
 *               end:
 *                 type: string
 *                 example: 2024-08-01
 *               notes:
 *                 type: string
 *                 example: Proyecto urgente por apertura del local en septiembre
 *               servicePrices:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     serviceName:
 *                       type: string
 *                       example: Electricidad
 *                     unitPrice:
 *                       type: number
 *                       example: 45
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Proyecto creado con éxito
 *               project:
 *                 _id: 66201b8a58b5d341ddca8e25
 *                 name: Reforma Local Madrid
 *                 archived: false
 *       400:
 *         description: Project already exists for the user and client
 *         content:
 *           application/json:
 *             example:
 *               message: Ese proyecto ya existe para este cliente / usuario
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', createProjectValidator, createProject);

//get a project
/**
 * @swagger
 * /api/project/one/{id}:
 *   get:
 *     summary: Get a single project by ID
 *     description: Retrieves a project by ID if it belongs to the authenticated user.
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the project
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project found
 *         content:
 *           application/json:
 *             example:
 *               project:
 *                 _id: 66201b8a58b5d341ddca8e25
 *                 name: Reforma Local Madrid
 *                 clientId: 661ebc5dc8b4f823cdcf4aa1
 *                 projectCode: REFORM-MAD-01
 *                 code: 2301-RM
 *                 address:
 *                   street: Calle Mayor
 *                   number: 15
 *                   postal: 28080
 *                   city: Madrid
 *                   province: Madrid
 *                 begin: 2024-05-01
 *                 end: 2024-08-01
 *                 notes: Proyecto urgente por apertura del local en septiembre
 *                 archived: false
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             example:
 *               message: Proyecto no encontrado
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/one/:id', getOneProject);

/**
 * @swagger
 * /api/project/archive:
 *   get:
 *     summary: Get archived projects of the authenticated user
 *     description: Returns all archived projects associated with the logged-in user.
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of archived projects
 *         content:
 *           application/json:
 *             example:
 *               projects:
 *                 - _id: 66201b8a58b5d341ddca8e25
 *                   name: Proyecto Antiguo
 *                   archived: true
 *                   clientId: 661ebc5dc8b4f823cdcf4aa1
 *                   begin: 2023-02-01
 *                   end: 2023-06-01
 *                   notes: Proyecto finalizado
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/archive', getArchivedProjectsOfUser);

// update project
/**
 * @swagger
 * /api/project/{id}:
 *   patch:
 *     summary: Update a project
 *     description: Updates the fields of a project by ID if it belongs to the authenticated user. Supports fields like name, code, address, dates, service prices, etc.
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the project to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Reforma Local Retiro
 *               projectCode:
 *                 type: string
 *                 example: RETIRO-01
 *               address:
 *                 type: object
 *                 properties:
 *                   street: { type: string, example: Calle Atocha }
 *                   number: { type: number, example: 20 }
 *                   postal: { type: number, example: 28012 }
 *                   city: { type: string, example: Madrid }
 *                   province: { type: string, example: Madrid }
 *               begin:
 *                 type: string
 *                 example: 2024-06-01
 *               end:
 *                 type: string
 *                 example: 2024-08-15
 *               notes:
 *                 type: string
 *                 example: Proyecto con fechas ajustadas
 *               servicePrices:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     serviceName:
 *                       type: string
 *                       example: Fontanería
 *                     unitPrice:
 *                       type: number
 *                       example: 60
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Proyecto actualizado
 *               project:
 *                 _id: 66201b8a58b5d341ddca8e25
 *                 name: Reforma Local Retiro
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             example:
 *               message: Proyecto no encontrado
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch('/:id', updateProjectValidator, updateProject);

// delete project
/**
 * @swagger
 * /api/project/{id}:
 *   delete:
 *     summary: Delete a project
 *     description: Deletes a project permanently by ID if it belongs to the authenticated user.
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the project to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Proyecto eliminado definitivamente
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             example:
 *               message: Proyecto no encontrado
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', validatorIdParam ,  deleteProject);

// archiving project
/**
 * @swagger
 * /api/project/archive/{id}:
 *   delete:
 *     summary: Archive a project
 *     description: Archives a project by setting its 'archived' field to true. The project remains in the database but is hidden from active lists.
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the project to archive
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project archived successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Proyecto archivado
 *               project:
 *                 _id: 66201b8a58b5d341ddca8e25
 *                 archived: true
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             example:
 *               message: Proyecto no encontrado
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete('/archive/:id', validatorIdParam, archiveProject);

//restore an archived project
/**
 * @swagger
 * /api/project/recover/{id}:
 *   patch:
 *     summary: Recover an archived project
 *     description: Restores an archived project by setting its 'archived' field to false.
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the project to recover
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project recovered successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Proyecto restaurado (ya no está archivado)
 *               project:
 *                 _id: 66201b8a58b5d341ddca8e25
 *                 archived: false
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             example:
 *               message: Proyecto no encontrado
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch('/recover/:id', validatorIdParam, recoverProject);

module.exports = router;
