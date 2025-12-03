const express = require('express');
const router = express.Router({ mergeParams: true });
const teamController = require('../controllers/team');
const {teamValidation } = require('../validation/team');

//address methods by url /teams to controller to create or get all teams
router.route("/")
.get(teamController.getAllTeams)
.post(teamValidation, teamController.postTeam); // here validates data to create a new team  

//adress methods by url /teams/:id to controllers, which need the id of the team to update/delete or get this tam by id
router.route("/:id")
.get(teamController.getByIdTeam)
.put(teamValidation, teamController.putTeam) /*Here validates updated body*/ 
.delete(teamController.deleteTeam);

module.exports = router;