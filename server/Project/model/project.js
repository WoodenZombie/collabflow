const db = require('../../db/db')

class ProjectModel {
    async post(data) {
        const [id] = await db('projects').insert(data);
        return this.getById(id);
    }

    async getAll(){
        return await db('projects').select('*');
    }

    async getById(id) {
        return await db('projects').where({id}).first();
    }

    async update(id, data){
        await db('projects').where({id}).update(data);
        return this.getById(id);
    }

    async delete(id){
        const project = await this.getById(id);
        if(!project) return null;
        await db('projects').where({id}).del();
        return project;
    }
}
module.exports = new ProjectModel();