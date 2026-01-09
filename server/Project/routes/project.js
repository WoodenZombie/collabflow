const express = require("express");
const router = express.Router();
const projectController = require("../controllers/project");
const {projectValidation} = require('../validation/project');
const taskRouter = require("./task");
const appointmentRouter = require('../../Appointment/routes/appointment');
const teamRouter = require("../../Team/routes/team");
const verifyRole = require('../../common/middleware/verifyRole');

//routs which are used in index.js and sents requests or take responses from controller
router.get("/projects", projectController.getAllProjects);
//Validates income data to create a new project
router.post("/projects", projectValidation, projectController.postProject);
router.get("/projects/:id", projectController.getByIdProject);
//Validates income data for updating existing project
router.put("/projects/:id", verifyRole('Project Manager', 'project', 'id', 'role'), projectValidation, projectController.putProject);
router.delete("/projects/:id", verifyRole('Project Manager', 'project', 'id', 'role'),projectController.deleteProject);
//endpoint for adding user to project
router.post('/projects/:id/members',
    verifyRole('Project Manager', 'project', 'id', 'role'),
    projectController.addProjectMember 
);

//endpoint for removing user from project
router.delete('/projects/:id/members/:memberId',
    verifyRole('Project Manager', 'project', 'id', 'role'),
    projectController.removeProjectMember 
);

// souvisejici routy pro porojects
router.use("/projects/:id/tasks", taskRouter);
router.use("/projects/:id/appointments", appointmentRouter);
router.use('/projects/:id/teams', teamRouter);

module.exports = router;
