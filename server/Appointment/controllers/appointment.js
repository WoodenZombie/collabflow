const appointmentModel = require("../model/appointment");
const asyncErrorHandler = require("../../common/middleware/asyncErrorHandler");
const customError = require("../../common/utils/customError");

// This controller sends requests to DB and returns responses

// returns all cards that exist
exports.getAllAppointment = asyncErrorHandler(async (req, res, next) => {
  const projectId = req.params.id;
  if(!projectId) return next(new customError('projectId query parameter is required', 400));

  const appointments = await appointmentModel.getAppointmentsByProject(projectId);
  res.status(200).json(appointments);
});

// returns a card by its ID with status 200 or an error 404
exports.getAppointmentById = asyncErrorHandler(async (req, res, next) => {
  const appointment = await appointmentModel.getById(req.params.appointmentId);

  if (!appointment) return next(new customError("Appoitnment with this ID is not found", 404));

  res.status(200).json(appointment);
});

// creates a new card, validates input and returns it with status 201 or error

exports.postAppointment = asyncErrorHandler(async (req, res, next) => {
    const { participants, ...appointmentData } = req.body; // Separate participants array
    const userId = req.user.id;
    const projectId = req.params.id;

    if (!projectId) return next(new customError("Project ID is required", 400));

    appointmentData.project_id = projectId;
    const newAppointment = await appointmentModel.createAppointment(appointmentData, userId, participants);
    res.status(201).json(newAppointment);
  });

// updates a card by ID and returns it with status 200 or an error 404
exports.putAppointment = asyncErrorHandler(async (req, res, next) => {
    const appointmentId = req.params.appointmentId;
    const { participants, ...updateData } = req.body;

    const updatedAppointment = await appointmentModel.updateAppointment(appointmentId, updateData, participants);

    if (!updatedAppointment) return next(new customError("Appointment with this ID is not found", 404));

    res.status(200).json(updatedAppointment);
  })

// deletes a card by ID and returns it with status 200 or an error 404
exports.deleteAppointment = asyncErrorHandler(async (req, res, next) => {
  const appointmentId = req.params.appointmentId;
  const deletedAppointment = await appointmentModel.deleteAppointment(appointmentId);

  if (!deletedAppointment) {
    const error = new customError("Appointment with this ID is not found", 404);
    return next(error);
  }

  res.status(200).json(deletedAppointment);
});