const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;


const tokenSign = (user) => {
    return jwt.sign(
        {
            _id: user._id,
            role: user.role
        },
        JWT_SECRET,
        {expiresIn: '2h'}
    )
}

const verifyToken = (tokenJwt) => {
    try {
        return jwt.verify(tokenJwt, JWT_SECRET);
    } catch (error) {
        console.log(error);
        return null;        
    }
}

const createResetToken = (userId) => {
    return jwt.sign(
        { 
            id: userId, 
            action: 'reset_password'
        },
        JWT_SECRET,
        {expiresIn: '10m'}
    )
}

module.exports = {tokenSign, verifyToken, createResetToken};