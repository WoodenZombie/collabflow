const db = require('../../db/db');

class AppointmentParticipantModel {

    //Checks if the user is a participant in the meeting.
    async isParticipant(appointmentId, userId) {
        return await db('appointment_participants')
            .where({ appointment_id: appointmentId, user_id: userId })
            .first();
    }
    
    //adding the user to the meeting.
    async addParticipant(appointmentId, userId) {
        const data = {
            appointment_id: appointmentId,
            user_id: userId
        };
        const [id] = await db('appointment_participants').insert(data);
        return id;
    }
    
    //deleting the user from the meeting
    async removeParticipant(appointmentId, userId) {
        return await db('appointment_participants')
            .where({ appointment_id: appointmentId, user_id: userId })
            .del();
    }

    // New: Remove all participants for an appointment (helper for updates/deletes)
    async removeAllParticipants(appointmentId) {
        return await db('appointment_participants')
            .where({ appointment_id: appointmentId })
            .del();
    }
}

module.exports = new AppointmentParticipantModel();