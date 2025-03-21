const express = require('express');
const { matchedData } = require('express-validator');
const { encrypt, compare } = require('../utils/handlePassword');
const { usersModel } = require('../models');
const { tokenSign, verifyToken } = require('../utils/handleJwt')

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

    // generamos el código de 6 dígitos y definimos número de intentos    
    const code = Math.floor(100000 + Math.random() * 999999).toString();
    const tries = 3;

    // dataUser = await usersModel.findByIdAndUpdate(); -> ESTO ESTABA EN LA PRÁCTICA QUE HEMOS HECHO EN CLASE

    // construimos cuerpo con datos para crear usuario 
    const body = { ...req, password: passwordHash, code};

    //creamos usuario en la base de datos
    const dataUser = await usersModel.create(body);

    // OCULTAR (se puede hacer de esta forma o de la de verifyEmail, no se cuál es la correcta(?))
    dataUser.set('tries', undefined, {strict: false});
    dataUser.set('password', undefined, { strict: false });
    dataUser.set('code', undefined, {strict: false});

    // preparamos respuesta
    const data = {
        token: tokenSign(dataUser),
        user: dataUser
    }

    res.send(data);
};

const login = async (req, res) => {
    try {
        req = matchedData(req);
        const dataUser = await usersModel.findOne({ email: req.email });

        if(!dataUser){
            return res.status(404).send({ error: 'Usuario no encontrado'});
        }

        if(!dataUser.state){
            return res.status(409).send({ error: 'La cuenta no está verificada.'});
        }

        if (!await compare(req.password, dataUser.password)) {
            return res.status(401).send({ error: 'Contraseña inválida' });
        }

        const userObject = dataUser.toObject();
        delete userObject.password;
        delete userObject.code;
        delete userObject.tries;

        const data = {
            token: tokenSign(dataUser),
            user: userObject
        };

        res.send(data);
    } catch (error) {
        console.log(error);
        return res.status(500).send({error: 'Error de servidor'});
    }
};

const verifyEmail = async(req, res) =>{
    try {
        const userId = req.user._id; //por el middleware
        const {code} = req.body;

        const user = await usersModel.findById(userId);
        console.log(user)
        if(!user){
            return res.status(404).send({ error: 'Usuario no encontrado'});
        }

        if(user.tries <= 0){
            return res.status(400).send({ error: 'Se acabaron los intentos'});
        }

        if(user.code != code){
            user.tries -= 1;
            await user.save();
            return res.status(400).send({ error: 'Código inválido'});
        }

        user.state = true;
        await user.save();

        
        //elimino campos que no quiero devolver
        const userObject = user.toObject();
        delete userObject._id;
        delete userObject.password;
        delete userObject.code;
        delete userObject.tries;

        return res.status(200).send({ message: 'Email verificado con éxito ', user:userObject});
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Error de servidor'});
    }
}


module.exports = { login, register, verifyEmail };