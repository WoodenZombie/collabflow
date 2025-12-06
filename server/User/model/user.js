const db = require('../../db/db');
class UserModel {
    async findOneByEmail(email) {
        return await db('users').where('email', email).first();
    }

    async findOneByRefreshToken(refreshToken){
        return await db('users').where({refresh_token: refreshToken}).first();
    }

    async create(userData){
        const [id] = await db('users').insert(userData);
        return this.findById(id);
    }

    async updateRefreshToken(id, refreshToken){
        await db('users').where({id}).update({refresh_token: refreshToken});
        return this.findById(id);
    }
}

module.exports = new UserModel();