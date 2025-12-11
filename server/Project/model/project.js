const db = require('../../db/db')
//requests to others entity tables
const taskModel = require("../model/task");
const appointmentModel = require("../../Appointment/model/appointment");

//This class sents requests from controller and return response back 
class ProjectModel {
    //create a project
    async post(data, userId) {
        data.created_by = userId;

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
        return this.getByIdWithoutCheck(projectId);
        // return this.getById(projectId, userId);
        // return this.getById(projectId);
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
        const project = await this.getByIdWithoutCheck(id);
        if(!project) return null;

        await db.transaction(async(trx) =>{
            // 1. Delete Tasks (Model handles assignees deletion)
            await taskModel.deleteTasksByProjectId(id);
            
            // 2. Delete Appointments (Model handles participants deletion)
            await appointmentModel.deleteAppointmentsByProjectId(id);
            
            // 3. Delete Teams and their Memberships
            // First, we need to clean up team_memberships to avoid FK constraint errors
            // Find all teams in this project
            const projectTeams = await trx('teams').where({ project_id: id }).select('id');
            const teamIds = projectTeams.map(t => t.id);

            if (teamIds.length > 0) {
                // Delete memberships of these teams
                await trx('team_memberships').whereIn('team_id', teamIds).del();
                // Now we can safely delete the teams
                await trx('teams').whereIn('id', teamIds).del();
            }

            // 4. Delete Project Memberships (cleanup the project itself)
            await trx('project_memberships').where({ project_id: id }).del();

            // 5. Finally, delete the Project
            await db('projects').transacting(trx).where({id}).del();
        });
        return project;
    }
}
module.exports = new ProjectModel();