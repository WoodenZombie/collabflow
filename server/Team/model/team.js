const db = require('../../db/db');
const teamMembershipModel = require('./teamMembership');
const projectMembershipModel = require('../projectMembership');
class TeamModel {
    //create team
    async post(data, userId){
        data.created_by = userId;
        const projectId = data.project_id;
        
        // We define the creator's role in the project to establish their role in the team
        const projectMembership = await projectMembershipModel.getMembership(projectId, userId);
        const userRole = projectMembership?.role || 'Team Member';
        const [teamId] = await db.transaction(async (trx) => {
            // create team
            const [id] = await trx('teams').insert(data);
            
            // adding the creator like team member 
            await trx('team_memberships').insert({
                team_id: id,
                user_id: userId,
                role: userRole
            });
            return [id];
        });

        return this.getById(teamId);
    }
    //return specific team, which is chosen by id 
    async getById(id){
        return await db('teams').where({id}).first();
    }
    //return all teams for project
    async getTeamsByProject(projectId) {
    const hasSnake = await db.schema.hasColumn('teams', 'project_id');
    if (hasSnake) {
        return await db('teams')
            .where({ project_id: projectId })
            .select('*');
    }

    const hasCamel = await db.schema.hasColumn('teams', 'projectId');
    if (hasCamel) {
        return await db('teams')
            .where({ projectId: projectId })
            .select('*');
    }

    return [];
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
        // Detect column name at runtime and delete accordingly
        const hasSnake = await db.schema.hasColumn('teams', 'project_id');
        if (hasSnake) {
            await db('teams').where({ project_id: projectId }).del();
            return;
        }
        const hasCamel = await db.schema.hasColumn('teams', 'projectId');
        if (hasCamel) {
            await db('teams').where({ projectId: projectId }).del();
            return;
        }
        // If no linking column exists, do nothing safely
    }
}

module.exports = new TeamModel();