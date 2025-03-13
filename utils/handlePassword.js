const bcryptjs = require('bcryptjs');

const encrypt = async(clearPassword) =>{
    //el num "salt" otorga aleatoriedad a la función hash al combinarla con password
    const hash = await bcryptjs.hash(clearPassword, 10)
    return hash
}


const compare = async (clearPassword, hashedPassword) =>{
    //compara entre la passwd en texto plano y su hash calculado anteriormente para decidir si coincide
    const result = await bcryptjs.compare(clearPassword, hashedPassword);
    return result;
}

module.exports = {encrypt, compare};