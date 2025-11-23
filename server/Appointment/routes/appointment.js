const express = require("express");
const router = express.Router({ mergeParams: true }); 
const appointmentController = require("../controllers/task");
const { appointmentValidation } = require("../validation/task");

router
  .route("/")
  .get(appointmentController.getAllAppointment)
  .post(appointmentValidation, appointmentController.postAppointment);

router
  .route("/:id")                   
  .get(appointmentController.getAppointmentById)
  .put(appointmentValidation, appointmentController.putAppointment)
  .delete(appointmentController.deleteAppointment);

module.exports = router;