const appointmentModel = require("../model/appointment");
const asyncErrorHandler = require("../../common/middleware/asyncErrorHandler");
const customError = require("../../common/utils/customError");

// This controller sends requests to DB and returns responses

// returns all cards that exist
exports.getAllAppointment = asyncErrorHandler(async (req, res, next) => {
  const projectId = req.params.id;
  if(!projectId) return next(new customError('projectId query parameter is required', 400));

  const appointments = await appointmentModel.getAppointmentsByProject(projectId);
  // console.log(`[appointments] GET /api/projects/${projectId}/appointments -> ${Array.isArray(appointments) ? appointments.length : 0} items`); I dpn't know if it's needed 
  res.status(200).json(appointments);
});

// returns a card by its ID with status 200 or an error 404
exports.getAppointmentById = asyncErrorHandler(async (req, res, next) => {
  const appointment = await appointmentModel.getById(req.params.id);

  if (!appointment) return next(new customError("Appoitnment with this ID is not found", 404));

  res.status(200).json(appointment);
});

// creates a new card, validates input and returns it with status 201 or error

exports.postAppointment = asyncErrorHandler(async (req, res, next) => {
    const data = req.body;
    //hard coded user, just until when we'll create Auth/Reg entity
    const userId = req.user.id;
    const projectId = req.params.id;

    if (!projectId) return next(new customError("Project ID is required", 400));

    data.project_id = projectId;
    const newAppointment = await appointmentModel.createAppointment(data, userId);
    res.status(201).json(newAppointment);
  });

// updates a card by ID and returns it with status 200 or an error 404
exports.putAppointment = asyncErrorHandler(async (req, res, next) => {
    const updatedAppointment = await appointmentModel.updateAppointment(req.params.id, req.body);

    if (!updatedAppointment) return next(new customError("Appointment with this ID is not found", 404));

    res.status(200).json(updatedAppointment);
  })

// deletes a card by ID and returns it with status 200 or an error 404
exports.deleteAppointment = asyncErrorHandler(async (req, res, next) => {
  const deletedAppointment = await appointmentModel.deleteAppointment(req.params.id);

  if (!deletedAppointment) {
    const error = new customError("Appointment with this ID is not found", 404);
    return next(error);
  }

  res.status(200).json(deletedAppointment);
});