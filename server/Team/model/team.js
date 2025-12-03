const db = require('../../db/db');

class TeamModel {
    //create team
    async post(data, userId){
        data.created_by = userId;
        const [id] = await db('teams').insert(data);
        return this.getById(id);
    }
    //return specific team, which is chosen by id 
    async getById(id){
        return await db('teams').where({id}).first();
    }
    //return all teams
    async getAll(){
        return await db('teams').select('*');
    }
    //update a specific team, depending by its id 
    async update(id, data){
        await db('teams').where({id}).update(data);
        return this.getById(id);
    }
    // delete a chosen team by its id 
    async delete(id){
        const team = await this.getById(id);
        if(!team) return null;
        await db('teams').where({id}).del();
        return team;
    }
    async deleteTeamsByProjectId(projectId){
        await db("teams").where({project_id: projectId}).del();
    }
}

module.exports = new TeamModel();