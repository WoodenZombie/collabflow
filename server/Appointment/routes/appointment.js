const express = require("express");
const router = express.Router({ mergeParams: true }); 
const appointmentController = require("../controllers/appointment");
const { appointmentValidation } = require("../validation/appointment");
const verifyRole = require('../../common/middleware/verifyRole');

//roles
const MANAGER = 'Project Manager';
const MEMBER = 'Team Member';
const PROJECT_ROLES = [MANAGER, MEMBER];


router
  .route("/")
  .get(
      verifyRole(PROJECT_ROLES, 'project', 'id', 'role'),
      appointmentController.getAllAppointment
  )
  .post(
      verifyRole([MANAGER], 'project', 'id', 'role'),
      appointmentValidation, 
      appointmentController.postAppointment
  );
router
  .route("/:appointmentId")                   
  .get(
      verifyRole(PROJECT_ROLES, 'project', 'id', 'role'),
      appointmentController.getAppointmentById
  )
  .put(
      verifyRole([MANAGER], 'project', 'id', 'role'),
      appointmentValidation, 
      appointmentController.putAppointment
  )
  .delete(
      verifyRole([MANAGER], 'project', 'id', 'role'),
      appointmentController.deleteAppointment
  );

module.exports = router;
