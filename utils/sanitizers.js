//para cualquier petición
const sanitizeUser = (user) => {
    const obj = user.toObject();
    delete obj.password;
    delete obj.code;
    delete obj.tries;
    return obj;
};

//para cuando se registre/haga login, que solo se vea email, estado y rol (token en auth)
const minimalUser = (user) => ({
    email: user.email,
    status: user.verified,
    role: user.role
});

module.exports = {
    sanitizeUser,
    minimalUser
};
