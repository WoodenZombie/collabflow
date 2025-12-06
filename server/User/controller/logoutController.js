const User = require('../../User/model/user');

const handleLogout = async(req, res) =>{
    //don't forget to delete the accessToken on the client

    const cookies = req.cookies;
    if(!cookies?.jwt) return res.sendStatus(204); //NoContent
    const refreshToken = cookies.jwt;

    //is refreshToken in db?
    const foundUser = await User.findOneByRefreshToken(refreshToken);
    if(!foundUser){
        res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', secure: true});
        return res.sendStatus(204);
    }

    //Delete refreshToken in db
    await User.updateRefreshToken(foundUser.id, null);

    res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', /*secure:true*/}); //secure: true - only server on https 
    res.sendStatus(204);
}

module.exports = {handleLogout};