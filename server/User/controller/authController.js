const User = require('../../User/model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../db/db');
const ROLES_LIST = require('../../common/utils/roles_list');

const handleLogin = async (req, res) =>{
    const {password, email} = req.body;
    if(!email || !password) return res.status(400).json({'message': 'Email and password are required.'});

    const foundUser = await User.findOneByEmail(email);
    if(!foundUser) return res.sendStatus(401); //Unauthorized
    //evaluate password
    const match = await bcrypt.compare(password, foundUser.password_hash);
    if(match){
         //Admin check
        const adminCheck = await db('admins').where({ email }).first();
        const role = adminCheck ? 'Admin' : 'User';

        //create JWTs
        const accessToken = jwt.sign(
            {"UserInfo":{
                "id": foundUser.id,
                "email": foundUser.email,
                "role": role
            }},
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: '15m'}
        );
        const refreshToken = jwt.sign(
            {"email": foundUser.email}, 
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn: '1d'}
        );

        //saving refreshToken with current user
        await User.updateRefreshToken(foundUser.id, refreshToken);

        //saving jwt token to cookies in httpOnly, that it didn't get access throug javascript
        res.cookie('jwt', refreshToken, {httpOnly: true, sameSite: 'None', secure: process.env.NODE_ENV === 'production', maxAge: 24*60*60*1000});
        //comment  secure:true, if you test it in development mode, but uncomment it if it's in production or browser
        res.json({accessToken})
    } else {
        res.sendStatus(401);
    }
}

module.exports = {handleLogin};