const projectModel = require('../model/project');
const {projectValidation} = require('../validation/project');
const asyncErrorHandler = require('./../services/asyncErrorHandler');
const customError = require('./../services/customError');

exports.getAllProjects = asyncErrorHandler(async (req, res, next) => {
        const allProjects = await projectModel.getAll();
        res.status(200).json(allProjects);
});

exports.getByIdProject = asyncErrorHandler (async (req, res, next) => {
        const getByIdResponse = await projectModel.getById(req.params.id);
         if(!getByIdResponse){
        const error = new customError('Project with this ID is not found!', 404);
        return next(error);
    }
        res.status(200).json(getByIdResponse);
})

exports.postProject = [
    projectValidation,
    asyncErrorHandler(async (req, res, next) => {
        const postResponse = await projectModel.post(req.body);
        res.status(201).json(postResponse);
})];

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

exports.deleteProject = [
    projectValidation,
    asyncErrorHandler(async(req, res, next) =>{
        const deleteResponse = await projectModel.delete(req.params.id);
        if(!deleteResponse){
        const error = new customError('Project with this ID is not found!', 404);
        return next(error);
    }
        res.status(200).json(deleteResponse);
})];