const {handleHttpError} = require('../utils/handleHttpError');
const {verifyToken} = require('../utils/handleJwt');
const { usersModel} = require('../models/index');


const authMiddleware = async(req, res, next) =>{
    try {
        if(!req.headers.authorization){
            handleHttpError(res, 'NOT_TOKEN', 401);
            return
        }
        
        const token = req.headers.authorization.split(' ').pop();

       
        const dataToken = verifyToken(token);

        if(!dataToken || !dataToken._id){
            handleHttpError(res, 'ERROR_ID_TOKEN', 401)
            return
        }

        const user = await usersModel.findById(dataToken._id);

        if(!user){
            handleHttpError(res, 'USER_NOT_EXISTS', 404);
            return;
        }


        req.user = user; 
        next();
    } catch (error) {   
        handleHttpError(res, 'NOT_SESSION', 401)
    }
 
}


module.exports = {authMiddleware};