const {sendEmail} = require('../utils/handleEmail');
const {handleHttpError} = require('../utils/handleHttpError');
const {matchedData} = require('express-validator');

const send = async(req, res) =>{
    try {
        const info = matchedData(req);
        const data = await sendEmail(info);
        res.status(200).send({message: 'Correo enviado correctamente'});
    } catch (error) {
        console.log(error);
        handleHttpError(res, 'ERROR_SEND_EMAIL', 500);
    }
}

module.exports = {send};