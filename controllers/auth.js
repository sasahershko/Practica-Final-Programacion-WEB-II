const express = require('express');
const { matchedData } = require('express-validator');
const { encrypt, compare } = require('../utils/handlePassword');
const { usersModel } = require('../models');
const { tokenSign, verifyToken } = require('../utils/handleJwt');
const { sendEmail } = require('../utils/handleEmail');
const { generateCodeAndSendEmail } = require('../utils/generateCodeAndSendEmail');

//para que no devuelva ciertos campos
const { minimalUser } = require('../utils/sanitizers');

const register = async (req, res) => {
    // extraemos solo los campos validados
    req = matchedData(req);

    // verificamos si el email ya está en la BBDD
    const existingUser = await usersModel.findOne({ email: req.email });
    if (existingUser) {
        return res.status(409).send({ error: 'Correo ya registrado' });
    }

    // encriptamos contraseña
    const passwordHash = await encrypt(req.password);

    const body = { ...req, password: passwordHash };
    const dataUser = await usersModel.create(body);

    await generateCodeAndSendEmail(dataUser, 'register');

    // preparamos respuesta
    const data = {
        token: tokenSign(dataUser),
        user: minimalUser(dataUser)
    }

    res.send(data);
};

const login = async (req, res) => {
    try {
        req = matchedData(req);
        const dataUser = await usersModel.findOne({ email: req.email });


        if (!dataUser) {
            return res.status(404).send({ error: 'Usuario no encontrado' });
        }

        if (!dataUser.active) {
            return res.status(403).send({ error: 'Usuario desactivado' });
        }

        if (!dataUser.verified) {
            return res.status(409).send({ error: 'La cuenta no está verificada.' });
        }

        if (!await compare(req.password, dataUser.password)) {
            return res.status(401).send({ error: 'Contraseña inválida' });
        }

        const data = {
            token: tokenSign(dataUser),
            user: minimalUser(dataUser)
        };

        res.send(data);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Error de servidor' });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const userId = req.user._id; //por el middleware
        const { code } = req.body;

        const user = await usersModel.findById(userId);

        if (!user) {
            return res.status(404).send({ error: 'Usuario no encontrado' });
        }

        if (user.tries <= 0) {
            return res.status(400).send({ error: 'Se acabaron los intentos' });
        }

        if (user.code != code) {
            user.tries -= 1;
            await user.save();
            return res.status(400).send({ error: 'Código inválido' });
        }

        user.verified = true;
        await user.save();



        return res.status(200).send({ message: 'Email verificado con éxito ', user: minimalUser(user) });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Error de servidor' });
    }
}


module.exports = { login, register, verifyEmail };