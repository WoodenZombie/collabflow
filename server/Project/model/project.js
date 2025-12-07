const db = require('../../db/db')
//requests to others entity tables
const taskModel = require("../model/task");
const teamModel = require("../../Team/model/team");
const appointmentModel = require("../../Appointment/model/appointment");

//This class sents requests from controller and return response back 
class ProjectModel {
    //create a project
    async post(data, userId) {
        const [projectId] = await db.transaction(async(trx) => {
            const [id] = await trx('projects').insert(data);
            
            // Making creator of project to Project Manager
            await trx('project_memberships').insert({
                project_id: id,
                user_id: userId,
                role: 'Project Manager'
            });
            return [id];
        });
        return this.getById(projectId);
    }
//return all projects that exists for its creator
    async getAll(userId){
        return await db('projects')
            .join('project_memberships as pm', 'projects.id', 'pm.project_id')
            .where('pm.user_id', userId)
            .select('projects.*', 'pm.role');
    }
//return a project by user id
    async getById(projectId, userId) {
        return await db('projects')
            .join('project_memberships as pm', 'projects.id', 'pm.project_id')
            .where('projects.id', projectId)
            .andWhere('pm.user_id', userId)
            .select('projects.*')
            .first();
    }
// update a project by its ID


    async update(id, data){
        await db('projects').where({id}).update(data);
        // To return the updated object, let's create a simple getByIdWithoutCheck method.
        return this.getByIdWithoutCheck(id);
    }

    // A new method for use within the model that does not require membership verification
    async getByIdWithoutCheck(id) {
        return await db('projects').where({id}).first();
    }
//delete a project by its ID
    async delete(id){
        const project = await this.getById(id);
        if(!project) return null;

        await db.transaction(async(trx) =>{
            await taskModel.deleteTasksByProjectId(id);
            await appointmentModel.deleteAppointmentsByProjectId(id);
            await teamModel.deleteTeamsByProjectId(id);
            await db('projects').transacting(trx).where({id}).del();
        });
        return project;
    }
}
module.exports = new ProjectModel();