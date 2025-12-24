const db = require('../../db/db');

class ProjectMembershipModel {

    // get user in project
    async getMembership(projectId, userId) {
        return await db('project_memberships')
            .where({ project_id: projectId, user_id: userId })
            .first();
    }

    // checking if the user has required role in a project 
    async checkRole(projectId, userId, requiredRole) {
        const membership = await this.getMembership(projectId, userId);
        if (!membership) return false;
        const userRole = membership.role;

        if (requiredRole === 'Project Manager') {
            return userRole === 'Project Manager';
        } 
        
        if (requiredRole === 'Team Member') {
            return userRole === 'Project Manager' || userRole === 'Team Member';
        }

        return userRole === requiredRole; 
    }

    // adding user to project
    async addMember(projectId, userId, role = 'Team Member') {
        const data = {
            project_id: projectId,
            user_id: userId,
            role: role
        };
        const [id] = await db('project_memberships').insert(data);
        return id;
    }

    // deleting user from project
    async removeMember(projectId, userId) {
        return await db('project_memberships')
            .where({ project_id: projectId, user_id: userId })
            .del();
    }
    
    // Helper to remove all members (used in cascades if needed externally)
    async deleteAllMembers(projectId) {
        return await db('project_memberships')
            .where({ project_id: projectId })
            .del();
    }
}

module.exports = new ProjectMembershipModel();