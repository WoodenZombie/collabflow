const teamMembershipModel = require('../../Team/model/teamMembership');
const projectMembershipModel = require('../../Project/model/projectMembership');

/**
 * Middleware to verify that user is a member of the team
 * Allows both Project Manager (in project) and Team Member (in team) to perform actions
 */
const verifyTeamMember = () => {
    return async (req, res, next) => {
        const userId = req.user.id;
        const teamId = req.params.teamId;
        const projectId = req.params.id;

        if (!teamId) {
            return res.status(400).json({ message: 'Team ID is required.' });
        }

        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required.' });
        }

        try {
            // Check if user is Project Manager in the project
            const projectMembership = await projectMembershipModel.getMembership(projectId, userId);
            const isProjectManager = projectMembership?.role === 'Project Manager';

            // Check if user is a member of the team
            const teamMembership = await teamMembershipModel.getMembership(teamId, userId);
            const isTeamMember = !!teamMembership;

            // Allow if user is Project Manager OR Team Member
            if (isProjectManager || isTeamMember) {
                return next();
            }

            // User is neither Project Manager nor Team Member
            return res.status(403).json({ 
                message: 'You must be a member of this team or a Project Manager to perform this action.' 
            });

        } catch (error) {
            console.error(`Error checking team membership for user ${userId} and team ${teamId}:`, error);
            return res.sendStatus(500);
        }
    };
};

module.exports = verifyTeamMember;
