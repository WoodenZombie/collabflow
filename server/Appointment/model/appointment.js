const db = require("../../db/db");

const appointmentModel = {
  async createAppointment(data, userId) {
    data.created_by = userId;

    const [id] = await db("appointments").insert(data);
    return this.getById(id);
  },

  async getAppointmentsByProject(projectId) {
    // Detect actual FK column name at runtime for robustness across environments
    const hasSnake = await db.schema.hasColumn('appointments', 'project_id');
    if (hasSnake) {
      return await db('appointments').where({ project_id: projectId });
    }
    const hasCamel = await db.schema.hasColumn('appointments', 'projectId');
    if (hasCamel) {
      return await db('appointments').where({ projectId: projectId });
    }
    // If no linking column exists, return empty array to avoid 500s
    return [];
  },

  async getById(id) {
    return await db("appointments").where({ id }).first();
  },

  async updateAppointment(id, data) {
    await db("appointments").where({ id }).update(data);
    return this.getById(id);
  },

  async deleteAppointment(id) {
    const task = await this.getById(id);
    if (!task) return null;

    await db("appointments").where({ id }).del();
    return task;
  },

  async deleteAppointmentsByProjectId(projectId){
    await db("appointments").where({project_id: projectId}).del();
  }
};

module.exports = appointmentModel;
