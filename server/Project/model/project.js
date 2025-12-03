const db = require('../../db/db')
//requests to others entity tables
const taskModel = require("../model/task");
const teamModel = require("../../Team/model/team");
const appointmentModel = require("../../Appointment/model/appointment");

//This class sents requests from controller and return response back 
class ProjectModel {
    //create a project
    async post(data) {
        const [id] = await db('projects').insert(data);
        return this.getById(id);
    }
//return all projects that exists
    async getAll(){
        return await db('projects').select('*');
    }
//return a project by its ID
    async getById(id) {
        return await db('projects').where({id}).first();
    }
// update a project by its ID
    async update(id, data){
        await db('projects').where({id}).update(data);
        return this.getById(id);
    }
//delete a project by its ID
    async delete(id){
        const project = await this.getById(id);
        if(!project) return null;

        await db.transaction(async(trx) =>{
            await taskModel.deleteTasksByProjectId(id);
            await appointmentModel.deleteAppointmentsByProjectId(id);
            await teamModel.deleteTeamsByProjectId(id);
            await db('projects').transacting(trx).where({id}).del();
        });
        return project;
    }
}
module.exports = new ProjectModel();