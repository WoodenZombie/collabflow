const express = require("express");
const router = express.Router();
const projectController = require('../controllers/project');

//routs which are used in index.js and sents requests or take responses from controller 
router.get('/projects', projectController.getAllProjects);
router.post('/projects', projectController.postProject);
router.get('/projects/:id', projectController.getByIdProject);
router.put('/projects/:id', projectController.putProject);
router.delete('/projects/:id', projectController.deleteProject);

module.exports = router;