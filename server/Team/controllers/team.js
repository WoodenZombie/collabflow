const teamModel = require('../model/team');
const asyncErrorHandler = require('../../common/middleware/asyncErrorHandler');
const customError = require('../../common/utils/customError');
//This controller sents request to DB and return responses or return an error with status

//sents body of data to db to get a team by its ID
exports.getByIdTeam = asyncErrorHandler(async (req, res, next)=>{
    const teamById = await teamModel.getById(req.params.id);
    if(!teamById) return next(new customError('Team with this ID is not found!', 404));
    res.status(200).json(teamById);
})

//sents requests for getting all teams or an error, if smth went wrong
exports.getAllTeams = asyncErrorHandler(async (req, res, next)=>{
    const allTeams = await teamModel.getAll();
    res.status(200).json(allTeams);
});

// sents requests to DB to create a new Team, which data is validated succesfully in router
exports.postTeam = asyncErrorHandler(async (req, res, next)=>{
    const data = req.body;
    //hard coded user, just until when we'll create Auth/Reg entity
    const userId = req.user?.id || 1;
    
    const createTeam = await teamModel.post(data, userId);
    res.status(201).json(createTeam);
});

//sents request to update some team to DB
exports.putTeam = asyncErrorHandler(async (req, res, next)=>{
    const updateTeam = await teamModel.update(req.params.id, req.body);
    if(!updateTeam) return next(new customError('Team with this ID is not found!', 404));
    res.status(200).json(updateTeam);
})

//sents request to delete some team by its ID to DB and return deleted team
exports.deleteTeam = asyncErrorHandler(async (req, res, next)=>{
    const deleteTeam = await teamModel.delete(req.params.id);
    if(!deleteTeam) return next(new customError('Team with this ID is not found!', 404));
    res.status(200).json(deleteTeam);
});