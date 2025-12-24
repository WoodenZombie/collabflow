const teamModel = require("../model/team");
const teamMembershipModel = require("../model/teamMembership");
const projectMembershipModel = require('../../Project/model/projectMembership');
const userModel = require('../../User/model/user');
const asyncErrorHandler = require("../../common/middleware/asyncErrorHandler");
const customError = require("../../common/utils/customError");
//This controller sents request to DB and return responses or return an error with status

//sents body of data to db to get a team by its ID
exports.getByIdTeam = asyncErrorHandler(async (req, res, next) => {
  const teamById = await teamModel.getById(req.params.teamId);
  if (!teamById) return next(new customError("Team with this ID is not found!", 404));
  res.status(200).json(teamById);
});

//sents requests for getting all teams under a specific project or an error, if smth went wrong
exports.getTeamsByProject = asyncErrorHandler(async (req, res, next) => {
    const projectId = req.params.id;
    if (!projectId) return next(new customError("projectId is required", 400));

    const teams = await teamModel.getTeamsByProject(projectId);
    res.status(200).json(teams);
});

// sents requests to DB to create a new Team, which data is validated succesfully in router
exports.postTeam = asyncErrorHandler(async (req, res, next) => {
  const data = req.body;
  const userId = req.user.id;
  const projectId = req.params.id;
  
  data.project_id = projectId;
  const createTeam = await teamModel.post(data, userId);
  res.status(201).json(createTeam);
});

//sents request to update some team to DB
exports.putTeam = asyncErrorHandler(async (req, res, next) => {
  const updateTeam = await teamModel.update(req.params.teamId, req.body);
  if (!updateTeam) return next(new customError("Team with this ID is not found!", 404));
  res.status(200).json(updateTeam);
});

//sents request to delete some team by its ID to DB and return deleted team
exports.deleteTeam = asyncErrorHandler(async (req, res, next) => {
  const deleteTeam = await teamModel.delete(req.params.teamId);
  if (!deleteTeam) return next(new customError("Team with this ID is not found!", 404));
  res.status(200).json(deleteTeam);
});


//adding user to team
exports.addTeamMember = asyncErrorHandler(async (req, res, next) => {
    const { email } = req.body;
    const teamId = req.params.teamId;
    const projectId = req.params.id;

    if (!email) return next(new customError('User email is required.', 400));

    // find user id by email
    const foundUser = await userModel.findOneByEmail(email); 
    if (!foundUser) return next(new customError(`User with email "${email}" not found.`, 404));
    
    const userIdToAdd = foundUser.id;

    const projectMember = await projectMembershipModel.getMembership(projectId, userIdToAdd);
    if (!projectMember) return res.status(400).json({ message: `User must be a member of the Project before joining a Team.` });

    // checking if user isn't already in another team
    const existingMembership = await teamMembershipModel.getMembership(teamId, userIdToAdd);
    if (existingMembership) return res.status(409).json({ message: `User ${email} is already a member of this team.` });
    
    // adding user to team, by default like 'Team Member'
    const membershipId = await teamMembershipModel.addMember(teamId, userIdToAdd, 'Team Member');
    
    res.status(201).json({ 
        message: `User ${foundUser.name} (${email}) successfully added to the team.`,
        membershipId: membershipId
    });
});

//removing user from team
exports.removeTeamMember = asyncErrorHandler(async (req, res, next) => {
    const teamId = req.params.teamId; 
    const userIdToRemove = req.params.memberId;

    // Check if the user is a team member
    const existingMembership = await teamMembershipModel.getMembership(teamId, userIdToRemove);
    if (!existingMembership) return next(new customError(`User is not a member of team ${teamId}.`, 404));
    
    // remove member from team
    const result = await teamMembershipModel.removeMember(teamId, userIdToRemove);
    
    // verification, that atleast one record was deleted
    if (result === 0) return next(new customError(`Could not remove user from team ${teamId}.`, 500));

    res.status(200).json({ 
        message: `User ${userIdToRemove} successfully removed from the team ${teamId}.`
    });
});