const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
    //Receiving token from auth header
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if(!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    
    const token = authHeader.split(' ')[1];
    
    jwt.verify(
        token, 
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) =>{
        if(err) return res.sendStatus(403); //INvalid token

        req.user = {
            id: decoded.UserInfo.id,
            login: decoded.UserInfo.email,
            };
        next();
    });
}

module.exports = verifyJWT;