const db = require("../../db/db");
const projectMembershipModel = require('../../Project/model/projectMembership');
const taskAssigneeModel = require('./taskAssignee');

const taskModel = {
  // Now accepts assignees array
  async createTask(data, userId, assignees = []) {
    data.created_by = userId;

    const [taskId] = await db.transaction(async(trx) => {
        // 1. Insert Task - starting_date se uloží automaticky z data
        const [id] = await trx("tasks").insert(data);
        
        // 2. Insert Assignees if present
        if (Array.isArray(assignees) && assignees.length > 0) {
            const assigneesData = assignees.map(uId => ({
                task_id: id,
                user_id: uId,
                primary_assignee: false // Default false
            }));
            await trx('task_assignees').insert(assigneesData);
        }
        return [id];
    });

    return this.getById(taskId);
  },

  async getTasksByProject(projectId) {
     // Старый код, оставляю как есть, но рекомендую проверить имена колонок
     // Я лишь исправлю проверку camel/snake case для надежности
     const hasSnake = await db.schema.hasColumn('tasks', 'project_id');
     const colName = hasSnake ? 'project_id' : 'projectId';

      return await db('tasks')
        .leftJoin('projects', `tasks.${colName}`, 'projects.id')
        .leftJoin('teams', 'tasks.team_id', 'teams.id')
        .select(
          'tasks.*',  // Obsahuje starting_date z DB
          'teams.name as team_name'
        )
        .where({ [`tasks.${colName}`]: projectId })
        .orderBy('tasks.created_at', 'desc')
        .then(tasks => tasks.map(task => ({
          ...task,
          teams: task.team_name ? [task.team_name] : []
        })));
  },

  async getById(id) {
    const task = await db("tasks")
      .leftJoin('projects', 'tasks.project_id', 'projects.id')
      .leftJoin('teams', 'tasks.team_id', 'teams.id')
      .select(
        'tasks.*',  // starting_date se vrátí automaticky
        'teams.id as team_id_val',
        'teams.name as team_name',
        'teams.description as team_description'
      )
      .where({ 'tasks.id': id })
      .first(); 
    if (!task) return null;

    // Fetch assignees
    const assignedUsers = await db('task_assignees')
        .join('users', 'task_assignees.user_id', 'users.id')
        .where({ task_id: id })
        .select('users.id', 'users.name', 'users.email', 'task_assignees.primary_assignee');

    const result = {
      ...task,
      teams: task.team_name ? [task.team_name] : [],
      assignees: assignedUsers // Return full user objects or just IDs based on frontend need
    };

    delete result.team_id_val;
    delete result.team_name;
    delete result.team_description;

    return result;
  },

  async getTasksByProjectFiltered(projectId, userId) {
        let isProjectManager = false;
        try {
            const membership = await projectMembershipModel.getMembership(projectId, userId);
            isProjectManager = membership?.role === 'Project Manager';
        } catch (err) {
            // If project_memberships table doesn't exist or query fails, assume user is not Project Manager
            console.warn('Error checking project membership, assuming user is not Project Manager:', err.message);
        }

        let query = db('tasks')
            .leftJoin('teams', 'tasks.team_id', 'teams.id')
            .where({ 'tasks.project_id': projectId })
            .select(
                'tasks.*',  // starting_date vráceno
                'teams.name as team_name'
            )
            .orderBy('tasks.created_at', 'desc');

        if (!isProjectManager) {
            try {
                query = query
                    .join('task_assignees as ta', 'tasks.id', 'ta.task_id')
                    .andWhere('ta.user_id', userId);
            } catch (err) {
                // If task_assignees table doesn't exist, show all tasks
                console.warn('Error filtering by task assignees, showing all tasks:', err.message);
            }
        }

        const tasks = await query;
        
        // Optimization: Fetch assignees for these tasks could be done here, 
        // but for list view usually simple data is enough.
        
        return tasks.map(task => ({
            ...task,
            teams: task.team_name ? [task.team_name] : []
        }));
    },

    async getTasksByUserId(userId) {
         return await db('tasks')
            .join('task_assignees as ta', 'tasks.id', 'ta.task_id')
            .leftJoin('teams', 'tasks.team_id', 'teams.id')
            .where('ta.user_id', userId)
            .select(
                'tasks.*',  // starting_date vráceno
                'teams.name as team_name'
            )
            .orderBy('tasks.created_at', 'desc')
            .then(tasks => tasks.map(task => ({
                ...task,
                teams: task.team_name ? [task.team_name] : []
            })));
    },
  
    async getTasksByTeamId(teamId) {
        return await db('tasks')
            .leftJoin('teams', 'tasks.team_id', 'teams.id')
            .where('tasks.team_id', teamId)
            .select(
                'tasks.*',  // starting_date vráceno
                'teams.name as team_name'
            )
            .orderBy('tasks.created_at', 'desc')
            .then(tasks => tasks.map(task => ({
                ...task,
                teams: task.team_name ? [task.team_name] : []
            })));
    },

    async getByIdWithoutAssociations(id) {
        return await db("tasks")
            .where({ id })
            .select('id', 'project_id', 'team_id', 'created_by', 'starting_date')  // Přidáno starting_date
            .first(); 
    },

  async updateTask(id, data, assignees) {
    data.updated_at = new Date();

    await db.transaction(async (trx) => {
        // 1. Update Task details - starting_date se aktualizuje z dat
        if (Object.keys(data).length > 0) {
            await trx("tasks").where({ id }).update(data);
        }

        // 2. Update Assignees if provided
        if (Array.isArray(assignees)) {
            // Remove old
            await trx("task_assignees").where({ task_id: id }).del();
            
            // Insert new
            if (assignees.length > 0) {
                 const assigneesData = assignees.map(uId => ({
                    task_id: id,
                    user_id: uId
                }));
                await trx("task_assignees").insert(assigneesData);
            }
        }
    });

    return this.getById(id);
  },

  async deleteTask(id) {
    const task = await this.getById(id);
    if (!task) return null;

    // Manual cascade delete just in case
    await db.transaction(async (trx) => {
         await trx("task_assignees").where({ task_id: id }).del();
         await trx("tasks").where({ id }).del();
    });

    return task;
  },

  async deleteTasksByProjectId(projectId){
    // Safe delete via ID fetch to ensure cascade
    const tasks = await db("tasks").where({project_id: projectId}).select('id');
    const ids = tasks.map(t => t.id);
    
    if (ids.length > 0) {
        await db("task_assignees").whereIn('task_id', ids).del();
        await db("tasks").whereIn('id', ids).del();
    }
  }
};

module.exports = taskModel;