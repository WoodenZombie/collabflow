const express = require("express");
const router = express.Router({ mergeParams: true }); 
const taskController = require("../controllers/task");
const { taskValidation } = require("../validation/task");

router
  .route("/")
  .get(taskController.getAllTask)
  .post(taskValidation, taskController.postTask);

router
  .route("/:id")                   
  .get(taskController.getTaskById)
  .put(taskValidation, taskController.putTask)
  .delete(taskController.deleteTask);

module.exports = router;