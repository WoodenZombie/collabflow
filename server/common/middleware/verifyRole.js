const projectMembershipModel = require('../../Project/model/projectMembership');
const teamMembershipModel = require('../../Team/model/teamMembership');
const taskAssigneeModel = require('../../Project/model/taskAssignee');
const appointmentParticipantModel = require('../../Appointment/model/appointmentMembership');

const entityModelMap = {
    'project': projectMembershipModel,
    'team': teamMembershipModel,
    'task': taskAssigneeModel,
    'appointment': appointmentParticipantModel
};


const verifyRole = (allowedRoles, entityType, idParamName, permissionType = 'role') => {
    return async (req, res, next) => {
        const userId = req.user.id;
        const entityId = req.params[idParamName] || req.body[idParamName];
        
        //Checking the existence of an entity ID
        if (!entityId) {
            return res.status(400).json({ message: `id of entity is required (${idParamName}).` });
        }

        const model = entityModelMap[entityType];
        if (!model) {
            console.error(`Unknown entity type:: ${entityType}`);
            return res.sendStatus(500);
        }

        try {
            let isAuthorized = false;

            // Performing checks depending on type
            if (permissionType === 'role') {
                const membership = await model.getMembership(entityId, userId);
                
                if (membership) {
                    const userRole = membership.role;
                    
                    if (allowedRoles.includes(userRole)) {
                        isAuthorized = true;
                    } else if (userRole === 'Project Manager' && allowedRoles.includes('Team Member')) {
                        isAuthorized = true;
                    }
                }

            } else if (permissionType === 'assignment') {
                if (entityType === 'task') {
                    isAuthorized = await model.checkAssignment(entityId, userId);
                }
                else if (entityType === 'appointment') {
                    isAuthorized = await model.isParticipant(entityId, userId);
                }
            }

            // Authorisation result
            if (isAuthorized) {
                next(); 
            } else {
                res.sendStatus(403); 
            }

        } catch (error) {
            console.error(`Error checking role for user ${userId} and ${entityType} ${entityId}:`, error);
            res.sendStatus(500);
        }
    };
};

module.exports = verifyRole;