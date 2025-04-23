const { clientsModel } = require('../models');
const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleHttpError');
const mongoose = require('mongoose'); //para verificar que es un id válido

const getAllClients = async (req, res) => {
    try {
        const user = req.user;
        const clients = await clientsModel.find({
            userId: user._id
        });
        return res.status(200).send({ clients });
    } catch (error) {
        console.error(error);
        return handleHttpError(res, 'ERROR_GET_ALL_CLIENTS', 500);
    }
};


const getClientById = async (req, res) => {
    const { id } = req.params;
  
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send({ error: 'Formato de ID inválido' });
    }
  
    try {
      const user = req.user;
      const client = await clientsModel.findOne({ _id: id, userId: user._id });
      if (!client) {
        return res.status(404).send({ message: 'Cliente no encontrado' });
      }
      return res.status(200).send({ client });
    } catch (error) {
      console.error(error);
      return handleHttpError(res, 'ERROR_GET_CLIENT', 500);
    }
  };


const createClient = async (req, res) => {
    try {
        const user = req.user;
        const data = matchedData(req);

        const { name, cif, address } = data;

        // verificar si ya existe un cliente con ese mismo nombre para ese user
        const clientExists = await clientsModel.findOne({
            userId: user._id,
            name
        });

        if (clientExists) {
            return res.status(400).send({ message: 'El cliente ya existe' });
        }

        const newClient = await clientsModel.create({
            userId: user._id,
            name,
            cif,
            address
        });

        return res.status(201).send({
            message: 'Cliente creado con éxito',
            client: newClient
        });
    } catch (error) {
        console.error(error);
        return handleHttpError(res, 'ERROR_CREATE_CLIENT', 500);
    }
};


const updateClient = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;

        console.log(id)
        console
        const data = matchedData(req);
        const { name, cif, address, logo } = data;

        const client = await clientsModel.findOneAndUpdate(
            { _id: id, userId: user._id },
            { name, cif, address, logo },
            { new: true }
        );

        if (!client) {
            return res.status(404).send({ message: 'Cliente no encontrado' });
        }

        return res.status(200).send({
            message: 'Cliente actualizado con éxito',
            client
        });
    } catch (error) {
        console.error(error);
        return handleHttpError(res, 'ERROR_UPDATE_CLIENT', 500);
    }
};


const recoverClient = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;

        const client = await clientsModel.findOneAndUpdate(
            { _id: id, userId: user._id },
            { archived: false },
            { new: true }
        );

        if (!client) {
            return res.status(404).send({ message: 'Cliente no encontrado' });
        }

        return res.status(200).send({
            message: 'Cliente restaurado (desarchivado)',
            client
        });
    } catch (error) {
        console.error(error);
        return handleHttpError(res, 'ERROR_RECOVER_CLIENT', 500);
    }
};



const getArchivedClients = async (req, res) => {
    try {
        const user = req.user;
        const archivedClients = await clientsModel.find({
            userId: user._id,
            archived: true
        });
        return res.status(200).send({ archivedClients });
    } catch (error) {
        console.error(error);
        return handleHttpError(res, 'ERROR_GET_ARCHIVED_CLIENTS', 500);
    }
};

const archiveClient = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;

        const client = await clientsModel.findOneAndUpdate(
            { _id: id, userId: user._id },
            { archived: true },
            { new: true } //para que me devuelva el último actualizado, no el anterior
        );

        if (!client) {
            return res.status(404).send({ message: 'Cliente no encontrado' });
        }

        return res.status(200).send({
            message: 'Cliente archivado',
            client
        });
    } catch (error) {
        console.error(error);
        return handleHttpError(res, 'ERROR_ARCHIVE_CLIENT', 500);
    }
};

const deleteClient = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;

        const client = await clientsModel.findOneAndDelete({ _id: id, userId: user._id });

        if (!client) {
            return res.status(404).send({ message: 'Cliente no encontrado' });
        }

        return res.status(200).send({
            message: 'Cliente eliminado permanentemente'
        });
    } catch (error) {
        console.error(error);
        return handleHttpError(res, 'ERROR_DELETE_CLIENT', 500);
    }
};

module.exports = {
    getAllClients,
    getClientById,
    createClient,
    updateClient,
    recoverClient,
    deleteClient,
    archiveClient,
    getArchivedClients
};
