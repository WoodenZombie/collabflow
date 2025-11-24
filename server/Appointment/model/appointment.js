const db = require("../../db/db");

const appointmentModel = {
  async createAppointment(data, userId) {
    data.created_by = userId;

    const [id] = await db("appointments").insert(data);
    return this.getById(id);
  },

  async getAppointmentsByProject(projectId) {
    return await db("appointments")
      .where({ project_id: projectId })
      .orderBy("created_at", "desc");
  },

  async getById(id) {
    return await db("appointments").where({ id }).first();
  },

  async updateAppointment(id, data) {
    data.updated_at = new Date();

    await db("appointments").where({ id }).update(data);
    return this.getById(id);
  },

  async deleteAppointment(id) {
    const task = await this.getById(id);
    if (!task) return null;

    await db("appointments").where({ id }).del();
    return task;
  },
};

module.exports = appointmentModel;
