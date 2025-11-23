const express = require("express");
const router = express.Router();
const projectController = require("../controllers/project");
const {projectValidation} = require('../validation/project');
const taskRouter = require("./task");

//routs which are used in index.js and sents requests or take responses from controller
router.get("/projects", projectController.getAllProjects);
//Validates income data to create a new project
router.post("/projects", projectValidation, projectController.postProject);
router.get("/projects/:id", projectController.getByIdProject);
//Validates income data for updating existing project
router.put("/projects/:id", projectValidation, projectController.putProject);
router.delete("/projects/:id", projectController.deleteProject);

router.use("/projects/:id/tasks", taskRouter);

module.exports = router;
