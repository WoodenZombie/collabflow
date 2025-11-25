const express = require("express");
const router = express.Router();
const projectController = require("../controllers/project");
const taskRouter = require("./task");
const teamRouter = require("../../Team/routes/team");

//routs which are used in index.js and sents requests or take responses from controller
router.get("/projects", projectController.getAllProjects);
router.post("/projects", projectController.postProject);
router.get("/projects/:id", projectController.getByIdProject);
router.put("/projects/:id", projectController.putProject);
router.delete("/projects/:id", projectController.deleteProject);

router.use("/projects/:id/tasks", taskRouter);

// Team routes
router.use(teamRouter);

module.exports = router;
