const {usersModel} = require('../models');
const { matchedData } = require('express-validator');

const getUsers = async (req, res) =>{
    try {
        // const data = await tracksModel.find({});  
        console.log('holi');      ;
    } catch (error) {
        console.log(error);
    }
};

const createUser = async (req, res) => {
    try {
        const  {body}  = matchedData(req);

        const data = await usersModel.create(body);
        res.json({ data });
    } catch (error) {
        // handleHttpError(res, 'ERROR_CREATE_ITEMS');
        console.log(error);
    }
}


module.exports = {getUsers, createUser}