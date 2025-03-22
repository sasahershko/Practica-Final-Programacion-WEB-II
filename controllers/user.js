const { usersModel } = require('../models');
const { handleHttpError } = require('../utils/handleHttpError');
const { matchedData } = require('express-validator');
const { uploadToPinata } = require('../utils/handleUploadIPFS')

//para no mostrar ciertos campos
const { sanitizeUser } = require('../utils/sanitizers');

const putUserRegister = async (req, res) => {
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
        const { company } = matchedData(req, { locations: ['body'] });

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

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.code = resetCode;
        await user.save();

        // Aquí enviarías el email en producción
        return res.status(200).send({ message: 'Código enviado', code: resetCode }); // Solo para test
    } catch (error) {
        return res.status(500).send({ error: 'Error al generar código' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        const user = await usersModel.findOne({ email, code });
        if (!user) {
            return res.status(400).send({ error: 'Código inválido' });
        }

        const hashed = await encrypt(newPassword); 
        user.password = hashed;
        // user.code = ''; // limpiar
        await user.save();

        return res.status(200).send({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        return res.status(500).send({ error: 'Error al cambiar contraseña' });
    }
};

const inviteUser = async (req, res) => {
    try {
        const inviter = req.user;
        const { email } = req.body;

        const userToInvite = await usersModel.findOne({ email });

        if (!userToInvite) {
            return res.status(404).send({ error: 'No existe ningún usuario con ese email' });
        }

        if (userToInvite.company?.name) {
            return res.status(400).send({ error: 'Ese usuario ya pertenece a una compañía' });
        }

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


module.exports = { getUser, deleteUser, putUserRegister, patchUserCompany, updateUserLogo };