// middleware/verifyTaskUpdate.js
const projectMembershipModel = require('../../Project/model/projectMembership');
const taskAssigneeModel = require('../../Project/model/taskAssignee');
const customError = require('../utils/customError');

const verifyTaskUpdate = () => {
    return async (req, res, next) => {
        const userId = req.user.id;
        const taskId = req.params.taskId || req.params.id; // task ID
        const updates = req.body;
        
        if (!taskId) {
            return res.status(400).json({ message: 'Task ID is missing.' });
        }

        try {
            const task = await require('../Task/model/task').getByIdWithoutAssociations(taskId);
            if (!task) {
                return next(new customError("Task not found.", 404));
            }
            const projectId = task.project_id;

            const membership = await projectMembershipModel.getMembership(projectId, userId);
            const isProjectManager = membership?.role === 'Project Manager';

            const isAssignedMember = await taskAssigneeModel.checkAssignment(taskId, userId);

            if (isProjectManager) {
                return next();
            }

            if (isAssignedMember) {
                const allowedUpdates = ['status_id'];

                const forbiddenUpdates = Object.keys(updates).filter(key => 
                    !allowedUpdates.includes(key) && key !== 'updated_at' 
                );

                if (forbiddenUpdates.length === 0 && updates.status_id) {
                    return next();
                } else if (forbiddenUpdates.length > 0) {
                    return res.status(403).json({ 
                        message: `Forbidden: Team Members can only update 'status_id'. Attempted to update: ${forbiddenUpdates.join(', ')}` 
                    });
                }
            }

            return res.sendStatus(403); 

        } catch (error) {
            console.error(`Error in task update verification for user ${userId}:`, error);
            res.sendStatus(500);
        }
    };
};

module.exports = verifyTaskUpdate;