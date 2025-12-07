const projectModel = require('../model/project');
const asyncErrorHandler = require('../../common/middleware/asyncErrorHandler');
const customError = require('../../common/utils/customError');
const userModel = require('../../User/model/user');
const projectMembershipModel = require("../model/projectMembership");
//This controller sents request to DB and return responses

// sents requests for returning all projects, that exists or error   
exports.getAllProjects = asyncErrorHandler(async (req, res, next) => {
        const allProjects = await projectModel.getAll(req.user.id);
        res.status(200).json(allProjects);
});

// sents a requests for returning a project by its ID with a status 200 or a message with error 404
exports.getByIdProject = asyncErrorHandler (async (req, res, next) => {
        const getByIdResponse = await projectModel.getById(req.params.id, req.user.id);
         if(!getByIdResponse){
        const error = new customError('Project with this ID is not found!', 404);
        return next(error);
    }
        res.status(200).json(getByIdResponse);
})

// sents a requests for creating a project and validate it and return it with status 201 or error
exports.postProject = asyncErrorHandler(async (req, res, next) => {
        const postResponse = await projectModel.post(req.body, req.user.id);
        res.status(201).json(postResponse);
});

// sents a requests for updating a project by ID and return it with 200 status or a message with error 404
exports.putProject = asyncErrorHandler(async (req, res, next) =>{
        const putResponse = await projectModel.update(req.params.id, req.body);
        if(!putResponse){
        const error = new customError('Project with this ID is not found!', 404);
        return next(error);
    }
        res.status(200).json(putResponse);
});

// sents a requests for deleting a project by ID and return it with 200 status or a message with error 404
exports.deleteProject = asyncErrorHandler(async(req, res, next) =>{
        const deleteResponse = await projectModel.delete(req.params.id);
        if(!deleteResponse){
        const error = new customError('Project with this ID is not found!', 404);
        return next(error);
    }
        res.status(200).json(deleteResponse);
});

exports.addProjectMember = asyncErrorHandler(async(req, res, next)=>{
        const {email} = req.body;
        const projectId = req.params.id;

        if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
        }
        //searcing user id by email  
        const foundUser = await userModel.findOneByEmail(email);
        if (!foundUser) return next(new customError(`user with this email "${email}" isn't found.`, 404));

        const userIdToAdd = foundUser.id;
        const existingMembership = await projectMembershipModel.getMembership(projectId, userIdToAdd);
        if (existingMembership) {
                return res.status(409).json({ message: `user ${email} is already a member.` });
        }

        const membershipId = await projectMembershipModel.addMember(projectId, userIdToAdd, 'Team Member');
        res.status(201).json({ 
                message: `User ${email} is added to project ${projectId}`,
                membershipId: membershipId 
        });
});