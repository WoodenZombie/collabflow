const db = require("../../db/db");
const appointmentParticipantModel = require('./appointmentParticipant');

const appointmentModel = {
  async createAppointment(data, userId) {
    data.created_by = userId;
    
    const [appointmentId] = await db.transaction(async(trx) => {
      //creates meeting
      const [id] = await trx("appointments").insert(data);
      //add creator to members
      await trx('appointment_participants').insert({
            appointment_id: id,
            user_id: userId
        });
      return [id];
      });
    return this.getById(appointmentId);
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
