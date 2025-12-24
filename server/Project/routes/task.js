const express = require("express");
const router = express.Router({ mergeParams: true }); 
const taskController = require("../controllers/task");
const { taskValidation } = require("../validation/task");
const verifyRole = require('../../common/middleware/verifyRole');
const verifyTaskUpdate = require('../../common/middleware/verifyTaskUpdate');

//roles
const MANAGER = 'Project Manager';
const MEMBER = 'Team Member';
const PROJECT_ROLES = [MANAGER, MEMBER];


router
  .route("/")
  .get(
    verifyRole(PROJECT_ROLES, 'project', 'id', 'role'),
    taskController.getAllTask
  )
  .post(
    verifyRole([MANAGER], 'project', 'id', 'role'),
    taskValidation, taskController.postTask
  );

router
  .route("/:taskId")                   
  .get(
    verifyRole(PROJECT_ROLES, 'project', 'id', 'role'), 
    taskController.getTaskById
  )
  .put(
    verifyTaskUpdate(),
    taskValidation, 
    taskController.putTask
  )
  .delete(
    verifyRole([MANAGER], 'project', 'id', 'role'), 
    taskController.deleteTask
  );

  //getting task for user
  router.get("/user/:userId", taskController.getTasksByUserId);
  //getting tasks by teams
  router.get("/team/:teamId", taskController.getTasksByTeamId);

module.exports = router;