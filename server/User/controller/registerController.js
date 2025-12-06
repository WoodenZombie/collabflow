const User = require('../../User/model/user');
const bcrypt = require('bcrypt');

const handleNewUser = async (req, res) =>{
    const {data} = req.body;

    if(!data.email || !data.password) return res.sendStatus(400).json({'message': 'Email and password are required.'}); 

    const duplicate = await User.findOneByEmail(data.email);
    if(duplicate) return req.sendStatus(409); // Conflict
    
    try {
        //encrypt and salt the password
        const hashedPwd = await bcrypt.hash(data.password, 10);
        // create and store the new user
        const result = await User.create({
            "email": data.email,
            "name": data.name,
            "password_hash": hashedPwd
        });
        
        console.log(result);

        res.status(201).json({'success': `New user ${data.email} created!`})
    } catch (err) {
        res.status(500).json({'message': err.message});
    }
}

module.exports = {handleNewUser};