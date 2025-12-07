const express = require('express');
const router = express.Router({ mergeParams: true });
const teamController = require('../controllers/team');
const {teamValidation } = require('../validation/team');
const verifyRole = require('../../middleware/verifyRole');

//roles
const MANAGER = 'Project Manager';
const MEMBER = 'Team Member';
const PROJECT_ROLES = [MANAGER, MEMBER];

//address methods by url /teams to controller to create or get all teams
router.route("/")
.get(
    verifyRole(PROJECT_ROLES, 'project', 'id', 'role'), 
    teamController.getTeamsByProject
)
.post(
    verifyRole([MANAGER], 'project', 'id', 'role'),
    teamValidation, 
    teamController.postTeam
); // here validates data to create a new team  

//adress methods by url /teams/:id to controllers, which need the id of the team to update/delete or get this tam by id
router.route("/:id")
.get(
    verifyRole(PROJECT_ROLES, 'project', 'id', 'role'),
    teamController.getByIdTeam
)
.put(
    verifyRole([MANAGER], 'project', 'id', 'role'),
    teamValidation, 
    teamController.putTeam
) /*Here validates updated body*/ 
.delete(
    verifyRole([MANAGER], 'project', 'id', 'role'),
    teamController.deleteTeam
);

//adding new member team (id = teamId)
router.post("/:id/members", 
    verifyRole([MANAGER], 'project', 'id', 'role'),
    teamController.addTeamMember
);

//removing team member
router.delete("/:id/members/:memberId",
    verifyRole([MANAGER], 'project', 'id', 'role'),
    teamController.removeTeamMember
);

module.exports = router;