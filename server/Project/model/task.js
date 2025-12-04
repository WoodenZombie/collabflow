const db = require("../../db/db");

const taskModel = {
  async createTask(data, userId) {
    data.created_by = userId;
    data.status_id = 1;

    const [id] = await db("tasks").insert(data);
    return this.getById(id);
  },

  async getTasksByProject(projectId) {
    // Detect actual FK column name at runtime for robustness across environments
    const hasSnake = await db.schema.hasColumn('tasks', 'project_id');
    if (hasSnake) {
      return await db('tasks')
        .leftJoin('projects', 'tasks.project_id', 'projects.id')
        .leftJoin('teams', 'projects.team_id', 'teams.id')
        .select(
          'tasks.*',
          'teams.name as team_name'
        )
        .where({ 'tasks.project_id': projectId })
        .orderBy('tasks.created_at', 'desc')
        .then(tasks => tasks.map(task => ({
          ...task,
          teams: task.team_name ? [task.team_name] : []
        })));
    }
    const hasCamel = await db.schema.hasColumn('tasks', 'projectId');
    if (hasCamel) {
      return await db('tasks')
        .leftJoin('projects', 'tasks.projectId', 'projects.id')
        .leftJoin('teams', 'projects.team_id', 'teams.id')
        .select(
          'tasks.*',
          'teams.name as team_name'
        )
        .where({ 'tasks.projectId': projectId })
        .orderBy('tasks.created_at', 'desc')
        .then(tasks => tasks.map(task => ({
          ...task,
          teams: task.team_name ? [task.team_name] : []
        })));
    }
    // If no linking column exists, return empty array to avoid 500s
    return [];
  },

  async getById(id) {
    // Get task with associated team information through project
    const task = await db("tasks")
      .leftJoin('projects', 'tasks.project_id', 'projects.id')
      .leftJoin('teams', 'projects.team_id', 'teams.id')
      .select(
        'tasks.*',
        'teams.id as team_id',
        'teams.name as team_name',
        'teams.description as team_description'
      )
      .where({ 'tasks.id': id })
      .first();

    if (!task) return null;

    // Format the response to include team information in the expected format
    const result = {
      ...task,
      teams: task.team_name ? [task.team_name] : []
    };

    // Clean up the extra fields we don't need in the response
    delete result.team_id;
    delete result.team_name;
    delete result.team_description;

    return result;
  },

  async updateTask(id, data) {
    data.updated_at = new Date();

    await db("tasks").where({ id }).update(data);
    return this.getById(id);
  },

  async deleteTask(id) {
    const task = await this.getById(id);
    if (!task) return null;

    await db("tasks").where({ id }).del();
    return task;
  },

  async deleteTasksByProjectId(projectId){
    await db("tasks").where({project_id: projectId}).del();
  }
};

module.exports = taskModel;
