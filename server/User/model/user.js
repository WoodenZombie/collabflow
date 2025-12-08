const db = require('../../db/db');
class UserModel {
    async findOneByRefreshToken(refreshToken){
        return await db('users').where({refresh_token: refreshToken}).first();
    }

    async findById(id) {
        return await db('users')
            .where({ id: id })
            .select('id', 'email', 'name')
            .first();
    }

    async create(userData){
        const [id] = await db('users').insert(userData);
        return this.findById(id);
    }

    async updateRefreshToken(id, refreshToken){
        await db('users').where({id}).update({refresh_token: refreshToken});
        return this.findById(id);
    }

    async findOneByEmail(email) {
        return await db('users')
            .where({ email: email })
            .select('id', 'email', 'name', 'password_hash')
            .first();
    }
}

module.exports = new UserModel();