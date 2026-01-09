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

// Add member to project
exports.addProjectMember = asyncErrorHandler(async(req, res, next)=>{
    const {email} = req.body;
    const projectId = req.params.id;

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }
    // searching user id by email  
    const foundUser = await userModel.findOneByEmail(email);
    if (!foundUser) return next(new customError(`User with this email "${email}" isn't found.`, 404));

    const userIdToAdd = foundUser.id;
    const existingMembership = await projectMembershipModel.getMembership(projectId, userIdToAdd);
    if (existingMembership) {
        return res.status(409).json({ message: `User ${email} is already a member.` });
    }

    const membershipId = await projectMembershipModel.addMember(projectId, userIdToAdd, 'Team Member');
    res.status(201).json({ 
        message: `User ${email} is added to project ${projectId}`,
        membershipId: membershipId 
    });
});

// Remove member from project
exports.removeProjectMember = asyncErrorHandler(async(req, res, next) => {
    const projectId = req.params.id;
    const userIdToRemove = req.params.memberId;
    const requestingUserId = req.user.id;

    // Validate project exists
    const project = await projectModel.getByIdWithoutCheck(projectId);
    if (!project) {
        return next(new customError(`Project with ID ${projectId} not found.`, 404));
    }

    // Validate user exists
    const userToRemove = await userModel.findById(userIdToRemove);
    if (!userToRemove) {
        return next(new customError(`User with ID ${userIdToRemove} not found.`, 404));
    }

    // Check if user is a member of the project
    const existingMembership = await projectMembershipModel.getMembership(projectId, userIdToRemove);
    if (!existingMembership) {
        return next(new customError(`User ${userIdToRemove} is not a member of project ${projectId}.`, 404));
    }

    // Prevent removing yourself (optional - can be removed if business logic allows)
    // if (String(userIdToRemove) === String(requestingUserId)) {
    //     return next(new customError('You cannot remove yourself from the project.', 400));
    // }

    // Remove member from project
    const result = await projectMembershipModel.removeMember(projectId, userIdToRemove);
    
    // Verify that at least one record was deleted
    if (result === 0) {
        return next(new customError(`Could not remove user ${userIdToRemove} from project ${projectId}.`, 500));
    }

    res.status(200).json({ 
        message: `User ${userToRemove.name} (${userToRemove.email}) successfully removed from project ${projectId}.`
    });
});