const db = require("../../db/db");
const taskModel = require("../model/task");
const asyncErrorHandler = require("../services/asyncErrorHandler");
const customError = require("../services/customError");

// This controller sends requests to DB and returns responses

// returns all cards that exist
exports.getAllTask = asyncErrorHandler(async (req, res, next) => {
  const projectId = req.params.id;
  if(!projectId) return next(new customError('projectId query parameter is required', 400));

  const tasks = await taskModel.getTasksByProject(projectId);
  res.status(200).json(tasks);
});

// returns a card by its ID with status 200 or an error 404
exports.getTaskById = asyncErrorHandler(async (req, res, next) => {
  const task = await taskModel.getById(req.params.id);

  if (!task) return next(new customError("Task with this ID is not found", 404));

  res.status(200).json(task);
});

// creates a new card, validates input and returns it with status 201 or error

exports.postTask = asyncErrorHandler(async (req, res, next) => {
    const data = req.body;
    //hard coded user, just until when we'll create Auth/Reg entity
    const userId = req.user?.id || 1;
    const projectId = req.params.id;

    if (!projectId) return next(new customError("Project ID is required", 400));

    data.project_id = projectId;
    const newTask = await taskModel.createTask(data, userId);
    res.status(201).json(newTask);
  });

// updates a card by ID and returns it with status 200 or an error 404
exports.putTask = asyncErrorHandler(async (req, res, next) => {
    const updatedTask = await taskModel.updateTask(req.params.id, req.body);

    if (!updatedTask) return next(new customError("Card with this ID is not found", 404));

    res.status(200).json(updatedTask);
  })

// deletes a card by ID and returns it with status 200 or an error 404
exports.deleteTask = asyncErrorHandler(async (req, res, next) => {
  const deletedTask = await taskModel.deleteTask(req.params.id);

  if (!deletedTask) {
    const error = new customError("Card with this ID is not found", 404);
    return next(error);
  }

  res.status(200).json(deletedTask);
});