const db = require('../../db/db');
const teamMembershipModel = require('./teamMembership');
const projectMembershipModel = require('../../Project/model/projectMembership');
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
        const team = await db('teams').where({id}).first();
        if (!team) return null;
        
        // Get team members with user information
        const members = await db('team_memberships')
            .where({ team_id: id })
            .join('users', 'team_memberships.user_id', 'users.id')
            .select(
                'users.id',
                'users.name',
                'users.email',
                'team_memberships.role'
            );
        
        // Format members data
        team.members = members.map(member => ({
            id: member.id,
            name: member.name,
            email: member.email,
            role: member.role
        }));
        
        return team;
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