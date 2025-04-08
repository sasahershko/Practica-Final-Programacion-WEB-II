const { usersModel } = require('../models');
const { handleHttpError } = require('../utils/handleHttpError');
const { matchedData } = require('express-validator');
const { uploadToPinata } = require('../utils/handleUploadIPFS');
const { sendEmail } = require('../utils/handleEmail');
const { generateCodeAndSendEmail } = require('../utils/generateCodeAndSendEmail');


//TOKEN para código de recuperación de passwd
const { tokenSign } = require('../utils/handleJwt');
const { encrypt } = require('../utils/handlePassword')

//para no mostrar ciertos campos
const { sanitizeUser } = require('../utils/sanitizers');

const patchUserRegister = async (req, res) => {
    try {
        const data = matchedData(req);
        const userId = req.user._id;

        const updatedUser = await usersModel.findByIdAndUpdate(userId, data, { new: true });

        return res.status(200).send({ message: 'Usuario editado con éxito', user: sanitizeUser(updatedUser) });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Internal error' });
    }
};



const patchUserCompany = async (req, res) => {
    try {
        const user = req.user;
        const { company } = matchedData(req);

        user.company = { ...company };

        await user.save();

        return res.status(200).send({ message: 'Compañía actualizada con éxito', user: sanitizeUser(user) });
    } catch (error) {
        console.error('Error en patchUserCompany:', error);
        return res.status(500).send({ error: 'Internal error' });
    }
};


const updateUserLogo = async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).send({ error: 'No se ha enviado ninguna imagen.' });
        }

        const { buffer, originalname } = file;

        // el tamaño ya controlado por multer (5MB)

        // subimos a IPFS
        const pinataResponse = await uploadToPinata(buffer, originalname);
        const ipfsHash = pinataResponse.IpfsHash;
        const logoURL = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${ipfsHash}`;

        //actualizamos el usuario (extraído del token)
        const userId = req.user._id;
        const user = await usersModel.findByIdAndUpdate(userId, { logo: logoURL }, { new: true });

        res.json({ message: 'Logo actualizado correctamente', logo: user.logo });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'ERROR_UPDATING_LOGO' });
    }
};

//* FUNCIONALIDADES EXTRA
const getUser = async (req, res) => {
    try {
        const user = req.user;

        return res.status(200).send({ user: sanitizeUser(user) });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Error del servidor' });
    }
}

const deleteUser = async (req, res) => {
    try {
        const user = req.user;
        const isSoft = req.query.soft !== 'false'; // por defecto es soft delete

        if (isSoft) {
            user.active = false; // desactivado
            await user.save();
            return res.status(200).send({ message: 'Usuario desactivado (soft delete)' });
        } else {
            await usersModel.deleteOne({ _id: user._id });
            return res.status(200).send({ message: 'Usuario eliminado permanentemente(hard delete)' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Error al eliminar el usuario' });
    }
};


const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await usersModel.findOne({ email });

        if (!user) {
            return res.status(404).send({ error: 'Usuario no encontrado' });
        }

        await generateCodeAndSendEmail(user, 'reset');


        return res.status(200).send({ message: 'Código enviado' });
    } catch (error) {
        return res.status(500).send({ error: 'Error al generar código' });
    }
};

const verifyResetCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await usersModel.findOne({ email });

        if (!user) {
            return res.status(404).send({ error: 'Usuario no encontrado' });
        }

        if (user.code !== code) {
            return res.status(400).send({ error: 'Código incorrecto' });
        }

        const token = tokenSign(user._id);

        return res.status(200).send({ message: 'Código verificado ', token });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Error al verificar código' });
    }
}

const resetPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const { id } = req.user;

        if (!password) {
            res.status(400).send({ message: 'Contraseña requerida' });
        }

        const user = await usersModel.findById(id);

        if (!user) {
            res.status(404).send({ message: 'Usuario no encontrado' });
        }

        user.password = await encrypt(password);
        await user.save();

        res.status(200).send({ message: 'Contraseña cambiada con éxito' });
    } catch (error) {
        res.status(500).send({ message: 'Error de servidor' });
    }
}

const inviteUser = async (req, res) => {
    try {
        // usuario que hace la invitación (ya viene autenticado y con req.user cargado)
        const inviter = req.user;
        const { email } = req.body; // email del usuario que se quiere invitar

        // buscar si ya existe un usuario con ese email
        let userToInvite = await usersModel.findOne({ email });

        // si NO existe, crear uno nuevo
        if (!userToInvite) {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            userToInvite = new usersModel({
                email,
                password: undefined,
                role: 'guest',
                company: inviter.company,
              });
              
              await userToInvite.save();
              
              await generateCodeAndSendEmail(userToInvite, 'invite');
              

            return res.status(201).send({
                message: 'Usuario creado e invitado con éxito',
                user: {
                    email: userToInvite.email,
                    role: userToInvite.role,
                    company: userToInvite.company
                }
            });
        }


        // si el usuario YA existe, validar que no se invite a sí mismo
        if (userToInvite._id.equals(inviter._id)) {
            return res.status(400).send({ error: 'No puedes invitarte a ti mismo' });
        }

        // validar si ese usuario ya tiene compañía asignada
        if (userToInvite.company) {
            return res.status(400).send({
                error: 'Ese usuario ya pertenece a una compañía'
            });
        }

        // asignar rol 'guest' y la compañía del que invita
        userToInvite.role = 'guest';
        userToInvite.company = inviter.company;
        await userToInvite.save();

        return res.status(200).send({
            message: 'Usuario invitado con éxito',
            user: {
                email: userToInvite.email,
                role: userToInvite.role,
                company: userToInvite.company
            }
        });
    } catch (error) {
        console.error('Error al invitar usuario:', error);
        return res.status(500).send({ error: 'Error al invitar al usuario' });
    }
};



module.exports = { getUser, deleteUser, patchUserRegister, patchUserCompany, updateUserLogo, requestPasswordReset, verifyResetCode, resetPassword, inviteUser };