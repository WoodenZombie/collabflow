const db = require("../../db/db");

const taskModel = {
  async createTask(data, userId) {
    data.created_by = userId;
    data.status_id = 1;

    const [id] = await db("tasks").insert(data);
    return this.getById(id);
  },

  async getTasksByProject(projectId) {
    return await db("tasks")
      .where({ project_id: projectId })
      .orderBy("created_at", "desc");
  },

  async getById(id) {
    return await db("tasks").where({ id }).first();
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
