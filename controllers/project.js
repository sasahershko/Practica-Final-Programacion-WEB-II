const {projectsModel} = require('../models');
const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleHttpError');


const getAllProjects = async (req, res) => {
  try {
    const user = req.user; 
    const projects = await projectsModel.find({
      userId: user._id,
      archived: false
    });
    return res.status(200).json({ projects });
  } catch (error) {
    console.error(error);
    return handleHttpError(res, 'ERROR_GET_PROJECTS', 500);
  }
};


const getOneProject = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const project = await projectsModel.findOne({
      _id: id,
      userId: user._id
    });
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    return res.status(200).json({ project });
  } catch (error) {
    console.error(error);
    return handleHttpError(res, 'ERROR_GET_ONE_PROJECT', 500);
  }
};


const getArchivedProjectsOfUser = async (req, res) => {
  try {
    const user = req.user;
    const projects = await projectsModel.find({
      userId: user._id,
      archived: true
    });
    return res.status(200).json({ projects });
  } catch (error) {
    console.error(error);
    return handleHttpError(res, 'ERROR_GET_ARCHIVED_PROJECTS_OF_USER', 500);
  }
};



const createProject = async (req, res) => {
  try {
    const user = req.user;
    const data = matchedData(req);

    const { clientId, name } = data;

    // verificar que no exista ya para ese user y cliente
    const projectExists = await projectsModel.findOne({
      userId: user._id,
      clientId,
      name
    });
    if (projectExists) {
      return res.status(400).json({
        message: 'Ese proyecto ya existe para este cliente / usuario'
      });
    }

    const newProject = await projectsModel.create({
      userId: user._id,
      ...data
    });

    return res.status(201).json({
      message: 'Proyecto creado con éxito',
      project: newProject
    });
  } catch (error) {
    console.error(error);
    return handleHttpError(res, 'ERROR_CREATE_PROJECT', 500);
  }
};


const updateProject = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const data = matchedData(req);

    const project = await projectsModel.findOneAndUpdate(
      { _id: id, userId: user._id },
      { ...data },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    return res.status(200).json({
      message: 'Proyecto actualizado',
      project
    });
  } catch (error) {
    console.error(error);
    return handleHttpError(res, 'ERROR_UPDATE_PROJECT', 500);
  }
};


const deleteProject = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const project = await projectsModel.findOneAndDelete({
      _id: id,
      userId: user._id
    });
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    return res.status(200).json({
      message: 'Proyecto eliminado definitivamente'
    });
  } catch (error) {
    console.error(error);
    return handleHttpError(res, 'ERROR_DELETE_PROJECT', 500);
  }
};


const archiveProject = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const project = await projectsModel.findOneAndUpdate(
      { _id: id, userId: user._id },
      { archived: true },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    return res.status(200).json({
      message: 'Proyecto archivado',
      project
    });
  } catch (error) {
    console.error(error);
    return handleHttpError(res, 'ERROR_ARCHIVE_PROJECT', 500);
  }
};



const recoverProject = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const project = await projectsModel.findOneAndUpdate(
      { _id: id, userId: user._id },
      { archived: false },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    return res.status(200).json({
      message: 'Proyecto restaurado (ya no está archivado)',
      project
    });
  } catch (error) {
    console.error(error);
    return handleHttpError(res, 'ERROR_RESTORE_PROJECT', 500);
  }
};


//? EXTRAS DEL SWAGGER QUE NO SÉ SI HAY QUE IMPLEMENTAR
// const addProjectPrices = async (req, res) => {
//   try {
//     const user = req.user;
//     const { id } = req.params;
//     const data = matchedData(req);
//     const { servicePrices } = data;

//     // hacemos push para insertar en el array
//     const project = await projectsModel.findOneAndUpdate(
//       { _id: id, userId: user._id },
//       { $push: { servicePrices: { $each: servicePrices } } },
//       { new: true }
//     );
//     if (!project) {
//       return res.status(404).json({ message: 'Proyecto no encontrado' });
//     }
//     return res.status(200).json({
//       message: 'Precios añadidos al proyecto',
//       project
//     });
//   } catch (error) {
//     console.error(error);
//     return handleHttpError(res, 'ERROR_ADD_PROJECT_PRICES', 500);
//   }
// };


// const activateOrDeactivateProject = async (req, res) => {
//     try {
//       const user = req.user;
//       const { id } = req.params;
//       // por ejemplo en el body: { "active": false } para desactivar
//       const { active } = req.body;
  
//       const project = await projectsModel.findOneAndUpdate(
//         { _id: id, userId: user._id },
//         { active },
//         { new: true }
//       );
//       if (!project) {
//         return res.status(404).json({ message: 'Proyecto no encontrado' });
//       }
//       return res.status(200).json({
//         message: `Proyecto puesto en active=${active}`,
//         project
//       });
//     } catch (error) {
//       console.error(error);
//       return handleHttpError(res, 'ERROR_ACTIVATE_OR_DEACTIVATE_PROJECT', 500);
//     }
//   };

// const getOneProjectByClient = async (req, res) => {
//     try {
//       const user = req.user;
//       const { client, id } = req.params;
//       const project = await projectsModel.findOne({
//         userId: user._id,
//         clientId: client,
//         _id: id
//       });
//       if (!project) {
//         return res.status(404).json({ message: 'Proyecto no encontrado' });
//       }
//       return res.status(200).json({ project });
//     } catch (error) {
//       console.error(error);
//       return handleHttpError(res, 'ERROR_GET_ONE_PROJECT_BY_CLIENT', 500);
//     }
//   };
  


// const getProjectsByClient = async (req, res) => {
//     try {
//       const user = req.user;
//       const { client } = req.params; //el id
//       const projects = await projectsModel.find({
//         userId: user._id,
//         clientId: client,
//         archived: false
//       });
//       return res.status(200).json({ projects });
//     } catch (error) {
//       console.error(error);
//       return handleHttpError(res, 'ERROR_GET_PROJECTS_BY_CLIENT', 500);
//     }
//   };

// const getArchivedProjectsFromClient = async (req, res) => {
//     try {
//       const user = req.user;
//       const { client } = req.params; // el id
//       const projects = await projectsModel.find({
//         userId: user._id,
//         clientId: client,
//         archived: true
//       });
//       return res.status(200).json({ projects });
//     } catch (error) {
//       console.error(error);
//       return handleHttpError(res, 'ERROR_GET_ARCHIVED_PROJECTS_FROM_CLIENT', 500);
//     }
//   };

module.exports = {
  // GET
  getAllProjects,
  getOneProject,
  getArchivedProjectsOfUser,

  // POST
  createProject,

  // PUT
  updateProject,

  // DELETE
  deleteProject,
  archiveProject,

  // PATCH
  recoverProject,
};

