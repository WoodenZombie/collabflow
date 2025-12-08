const User = require('../../User/model/user');
const bcrypt = require('bcrypt');

const handleNewUser = async (req, res) =>{
    const {email, password, name} = req.body;

    if(!email || !password) return res.status(400).json({'message': 'Email and password are required.'}); 

    const duplicate = await User.findOneByEmail(email);
    if(duplicate) return res.sendStatus(409); // Conflict
    
    try {
        //encrypt and salt the password
        const hashedPwd = await bcrypt.hash(password, 10);
        // create and store the new user
        await User.create({
            "email": email,
            "name": name,
            "password_hash": hashedPwd
        });

        res.status(201).json({'success': `New user ${email} created!`})
    } catch (err) {
        res.status(500).json({'message': err.message});
    }
}

module.exports = {handleNewUser};