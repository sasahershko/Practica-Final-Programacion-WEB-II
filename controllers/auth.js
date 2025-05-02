const express = require('express');
const { matchedData } = require('express-validator');
const { encrypt, compare } = require('../utils/handlePassword');
const { usersModel } = require('../models');
const { tokenSign, verifyToken } = require('../utils/handleJwt');
//const { sendEmail } = require('../utils/handleEmail');
const { generateCodeAndSendEmail } = require('../utils/generateCodeAndSendEmail');

//para que no devuelva ciertos campos
const { minimalUser } = require('../utils/sanitizers');

const register = async (req, res) => {
    try {
      const data = matchedData(req)   
      const { email, password } = data
  
      const existing = await usersModel.findOne({ email })
      if (existing) {
        return res.status(409).send({ error: 'Correo ya registrado' })
      }
  
      const passwordHash = await encrypt(password)
      const newUser = await usersModel.create({ ...data, password: passwordHash })
  
      await generateCodeAndSendEmail(newUser, 'register')
  
      return res.status(200).send({ 
        token: tokenSign(newUser),
        user: minimalUser(newUser)
      })
    } catch (err) {
      console.error(err)
      return res.status(500).send({ error: 'Error de servidor' })
    }
  }

  const login = async (req, res) => {
    try {
      const data = matchedData(req)     // <- aquí también
      const { email, password } = data
  
      const user = await usersModel.findOne({ email })
      if (!user) {
        return res.status(404).send({ error: 'Usuario no encontrado' })
      }
      if (!user.active) {
        return res.status(403).send({ error: 'Usuario desactivado' })
      }
      if (!user.verified) {
        return res.status(409).send({ error: 'La cuenta no está verificada.' })
      }
      const ok = await compare(password, user.password)
      if (!ok) {
        return res.status(401).send({ error: 'Contraseña inválida' })
      }
  
      return res.status(200).send({
        token: tokenSign(user),
        user: minimalUser(user)
      })
    } catch (err) {
      console.error(err)
      return res.status(500).send({ error: 'Error de servidor' })
    }
  }

  const verifyEmail = async (req, res) => {
    try {
      const userId = req.user._id           
      const { code } = matchedData(req) 
  
      const user = await usersModel.findById(userId)
      if (!user) {
        return res.status(404).send({ error: 'Usuario no encontrado' })
      }
      if (user.tries <= 0) {
        return res.status(400).send({ error: 'Se acabaron los intentos' })
      }
      if (user.code !== code) {
        user.tries -= 1
        await user.save()
        return res.status(400).send({ error: 'Código inválido' })
      }
  
      user.verified = true
      await user.save()
      return res.status(200).send({
        message: 'Email verificado con éxito',
        user: minimalUser(user)
      })
    } catch (err) {
      console.error(err)
      return res.status(500).send({ error: 'Error de servidor' })
    }
  }


module.exports = { login, register, verifyEmail };