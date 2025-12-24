const db = require('../../db/db');

class TaskAssigneeModel{

    //get the record of assigned task to user
    async isAssigned(taskId, userId) {
        return await db('task_assignees')
            .where({ task_id: taskId, user_id: userId })
            .first();
    } 

    //checking if the user is assigned to the task
    async checkAssignment(taskId, userId) {
        return !!(await this.isAssigned(taskId, userId));
    }

    //checking if the user is primary performer 
    async isPrimaryAssignee(taskId, userId) {
        const assignment = await this.isAssigned(taskId, userId);

        return assignment ? assignment.primary_assignee : false;
    }

    //assigning user to the task
    async assignUser(taskId, userId, isPrimary = false) {
        const data = {
            task_id: taskId,
            user_id: userId,
            primary_assignee: isPrimary
        };
        const [id] = await db('task_assignees').insert(data);
        return id;
    }

    //deleting assigning user for task
    async unassignUser(taskId, userId) {
        return await db('task_assignees')
            .where({ task_id: taskId, user_id: userId })
            .del();
    } 
}

module.exports = new TaskAssigneeModel();