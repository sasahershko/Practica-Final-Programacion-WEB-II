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
const { createProjectValidator, updateProjectValidator } = require('../validators/project')

// para que se utilice siempre el authMiddleware
router.use(authMiddleware);

// get all projects
router.get('/', getAllProjects);

// adding project
router.post('/', createProjectValidator, createProject);

//get a project
router.get('/one/:id', getOneProject);

//get archived projects of a user


//? get archived projects from a client-> de un cliente???
router.get('/archive', getArchivedProjectsOfUser);

// get projects


// get a project


// update project
router.patch('/:id', updateProjectValidator, updateProject);

// delete project
router.delete('/:id', deleteProject);

// archiving project
router.delete('/archive/:id', archiveProject);

// activate/deactivate project


//restore an archived project
router.patch('/recover/:id', recoverProject);

//add unit prices


module.exports = router;
