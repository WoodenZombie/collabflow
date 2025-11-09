const projectModel = require('../model/project');
const {projectValidation} = require('../validation/project');
const asyncErrorHandler = require('./../services/asyncErrorHandler');
const customError = require('./../services/customError');
//This controller sents request to DB and return responses

// sents a requests for returning all projects, that exists or error   
exports.getAllProjects = asyncErrorHandler(async (req, res, next) => {
        const allProjects = await projectModel.getAll();
        res.status(200).json(allProjects);
});

// sents a requests for returning a project by its ID with a status 200 or a message with error 404
exports.getByIdProject = asyncErrorHandler (async (req, res, next) => {
        const getByIdResponse = await projectModel.getById(req.params.id);
         if(!getByIdResponse){
        const error = new customError('Project with this ID is not found!', 404);
        return next(error);
    }
        res.status(200).json(getByIdResponse);
})

// sents a requests for creating a project and validate it and return it with status 201 or error
exports.postProject = [
    projectValidation,
    asyncErrorHandler(async (req, res, next) => {
        const postResponse = await projectModel.post(req.body);
        res.status(201).json(postResponse);
})];

// sents a requests for updating a project by ID and return it with 200 status or a message with error 404
exports.putProject = [
    projectValidation,
    asyncErrorHandler(async (req, res, next) =>{
        const putResponse = await projectModel.update(req.params.id, req.body);
        if(!putResponse){
        const error = new customError('Project with this ID is not found!', 404);
        return next(error);
    }
        res.status(200).json(putResponse);
})];

// sents a requests for deleting a project by ID and return it with 200 status or a message with error 404
exports.deleteProject = asyncErrorHandler(async(req, res, next) =>{
        const deleteResponse = await projectModel.delete(req.params.id);
        if(!deleteResponse){
        const error = new customError('Project with this ID is not found!', 404);
        return next(error);
    }
        res.status(200).json(deleteResponse);
});