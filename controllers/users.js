const { usersModel } = require('../models');
const { handleHttpError } = require('../utils/handleHttpError');
const { matchedData } = require('express-validator');

const getUsers = async (req, res) => {

    try {
        const data = await tracksModel.find({});
        res.send({ data });
    } catch (error) {
        handleHttpError(res, 'ERROR_GET_ITEMS');
    }
}

const getUser = async (req, res) => {
    const { id } = req.params;
    res.send({ message: 'Devolviendo usuario...' }, id);
}


const createUser = async (req, res) => {
    try {
        const { body } = matchedData(req);

        const data = await usersModel.create(body);
        res.json({ data });
    } catch (error) {
        handleHttpError(res, 'ERROR_CREATE_ITEMS');
    }
}


const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { body } = matchedData(req);
        const data = await usersModel.findOneAndUpdate({ _id: id }, body, { new: true });
        res.json({ data });
    } catch (error) {
        handleHttpError(res, 'ERROR_UPDATE_ITEMS');
    }
}


const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const role = req.user.role;
        const data = await usersModel.findOneAndUpdate({ _id: id }, { role }, { new: true });
        res.json({ data });
    } catch (error) {
        handleHttpError(res, 'ERROR_UPDATE_ROLE');
    }
}

const deleteUser = async (req, res) => {
    const { id } = req.params;
    const data = await usersModel.findOneAndDelete(id);

    res.json({ data });
}

//* NUEVAS FUNCIONALIDADES
const putUserRegister = async (req, res) => {
    try {
        const data = matchedData(req);

        const user = req.user;

        user.email = data.email;
        user.name = data.name;
        user.surnames = data.surnames;
        user.nif = data.nif;

        await user.save();

        return res.status(200).send({ message: 'Usuario editado con éxito', user });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Internal error' });
    }
}


const patchUserCompany = async (req, res) => {
    try {
        const user = req.user;
        const { company } = req.body;

        if (company.name) user.company.name = company.name;
        if (company.cif) user.company.cif = company.cif;
        if (company.street) user.company.street = company.street;
        if (company.number !== undefined) user.company.number = company.number;
        if (company.postal !== undefined) user.company.postal = company.postal;
        if (company.city) user.company.city = company.city;
        if (company.province) user.company.province = company.province;

        await user.save();

        return res.status(200).send({ message: 'Compañía actualizada con éxito', user });
    } catch (error) {
        console.error('Error en patchUserCompany:', error);
        return res.status(500).send({ error: 'Internal error' });
    }
}


module.exports = { getUsers, getUser, createUser, updateUser, deleteUser, updateRole, putUserRegister, patchUserCompany };