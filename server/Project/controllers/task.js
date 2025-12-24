const taskModel = require("../model/task");
const asyncErrorHandler = require("../../common/middleware/asyncErrorHandler");
const customError = require("../../common/utils/customError");

// This controller sends requests to DB and returns responses

// returns all cards that exist
exports.getAllTask = asyncErrorHandler(async (req, res, next) => {
  const projectId = req.params.id;
  const userId = req.user.id;

  if(!projectId) return next(new customError('projectId query parameter is required', 400));

  const tasks = await taskModel.getTasksByProjectFiltered(projectId, userId);
  res.status(200).json(tasks);
});

// returns a card by its ID with status 200 or an error 404
exports.getTaskById = asyncErrorHandler(async (req, res, next) => {
  const task = await taskModel.getById(req.params.taskId);

  if (!task) return next(new customError("Task with this ID is not found", 404));

  res.status(200).json(task);
});

//getting tasks by user id
exports.getTasksByUserId = asyncErrorHandler(async (req, res, next) => {
    const userId = req.params.userId;
    
    const tasks = await taskModel.getTasksByUserId(userId);
    res.status(200).json(tasks);
});

exports.getTasksByTeamId = asyncErrorHandler(async (req, res, next) => {
    const teamId = req.params.teamId; // getting team ID from URL
    
    if(!teamId) return next(new customError('Team ID is required in URL parameters', 400));

    const tasks = await taskModel.getTasksByTeamId(teamId);
    res.status(200).json(tasks);
});

// creates a new card, validates input and returns it with status 201 or error
exports.postTask = asyncErrorHandler(async (req, res, next) => {
    // Extract assignees array [1, 2, 3] from body
    const { assignees, ...data } = req.body;
    const userId = req.user.id;
    const projectId = req.params.id;

    if (!projectId) return next(new customError("Project ID is required", 400));

    data.project_id = projectId;
    const newTask = await taskModel.createTask(data, userId, assignees);
    res.status(201).json(newTask);
  });

// updates a card by ID and returns it with status 200 or an error 404
exports.putTask = asyncErrorHandler(async (req, res, next) => {
  // Extract assignees to handle reassignment
    const { assignees, ...data } = req.body;
    const taskId = req.params.taskId;
    
    const updatedTask = await taskModel.updateTask(taskId, data, assignees);

    if (!updatedTask) return next(new customError("Card with this ID is not found", 404));

    res.status(200).json(updatedTask);
  })

// deletes a card by ID and returns it with status 200 or an error 404
exports.deleteTask = asyncErrorHandler(async (req, res, next) => {
  const deletedTask = await taskModel.deleteTask(req.params.taskId);

  if (!deletedTask) {
    const error = new customError("Card with this ID is not found", 404);
    return next(error);
  }

  res.status(200).json(deletedTask);
});