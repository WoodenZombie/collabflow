const db = require('../../db/db');

class TeamMembershipModel{

    //get user in a team 
    async getMembership(teamId, userId) {
        return await db('team_memberships')
            .where({ team_id: teamId, user_id: userId })
            .first();
    }

    //checking if the user has required role 
    async checkRole(teamId, userId, requiredRole) {
        const membership = await this.getMembership(teamId, userId);
        if (!membership) return false;
        
        const userRole = membership.role;

        if (requiredRole === 'Team Member' && userRole === 'Project Manager') {
            return true;
        }

        return userRole === requiredRole;
    }

    //adding user to team
    async addMember(teamId, userId, role = 'Team Member') {
        const data = {
            team_id: teamId,
            user_id: userId,
            role: role
        };
        const [id] = await db('team_memberships').insert(data);
        return id;
    }

    //removing user from the team
    async removeMember(teamId, userId) {
        return await db('team_memberships')
            .where({ team_id: teamId, user_id: userId })
            .del();
    }
}

module.exports = new TeamMembershipModel();