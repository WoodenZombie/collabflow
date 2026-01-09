const db = require("../../db/db");
const appointmentParticipantModel = require('./appointmentMembership');

const appointmentModel = {
  async createAppointment(data, userId, participants = []) {
    data.created_by = userId;

    // Ensure unique participants and include creator if not present (optional logic, usually creator should be there)
    const uniqueParticipants = new Set([...participants, userId]);
    const participantIds = Array.from(uniqueParticipants);
    
    const [appointmentId] = await db.transaction(async(trx) => {
      //creates meeting
      const [id] = await trx("appointments").insert(data);
      //prepare participants
      const participantsData = participantIds.map(pId => ({
          appointment_id: id,
          user_id: pId
      }));

      //insert participants
      if (participantsData.length > 0) {
          await trx('appointment_participants').insert(participantsData);
      }
      return [id];
      });
    return this.getById(appointmentId);
  },

  async getAppointmentsByProject(projectId) {
    // Get all appointments for the project
    const appointments = await db('appointments').where({ project_id: projectId });
    
    // Fetch participants for each appointment
    const appointmentsWithParticipants = await Promise.all(
      appointments.map(async (appointment) => {
        const participants = await db("appointment_participants")
          .where({ appointment_id: appointment.id })
          .select('user_id');
        
        appointment.participants = participants.map(p => p.user_id);
        return appointment;
      })
    );
    
    return appointmentsWithParticipants;
  },

  async getById(id) {
    const appointment = await db("appointments").where({ id }).first();
    if (!appointment) return null;

    // Fetch participants to return with the appointment object
    const participants = await db("appointment_participants")
        .where({ appointment_id: id })
        .select('user_id');
    
    appointment.participants = participants.map(p => p.user_id);
    return appointment;
  },

  async updateAppointment(id, data, participants) {
    await db.transaction(async (trx) => {
        // 1. Update appointment details
        if (Object.keys(data).length > 0) {
            await trx("appointments").where({ id }).update(data);
        }

        //Update participants if provided array exists
        if (Array.isArray(participants)) {
            // Remove old participants
            await trx("appointment_participants").where({ appointment_id: id }).del();

            // Insert new participants
            if (participants.length > 0) {
                const participantsData = participants.map(pId => ({
                    appointment_id: id,
                    user_id: pId
                }));
                await trx("appointment_participants").insert(participantsData);
            }
        }
    });

    return this.getById(id);
  },

  async deleteAppointment(id) {
    const appointment = await this.getById(id);
    if (!appointment) return null;

    await db.transaction(async (trx) => {
        // Manual cascade delete (just in case DB FK cascade is missing)
        await trx("appointment_participants").where({ appointment_id: id }).del();
        await trx("appointments").where({ id }).del();
    });
    return appointment;
  },

  async deleteAppointmentsByProjectId(projectId){
    // This will likely need to delete participants first too if no DB CASCADE
    const appointments = await db("appointments").where({ project_id: projectId }).select('id');
    const ids = appointments.map(a => a.id);

    if (ids.length > 0) {
        await db("appointment_participants").whereIn('appointment_id', ids).del();
        await db("appointments").whereIn('id', ids).del();
    }
  }
};

module.exports = appointmentModel;
