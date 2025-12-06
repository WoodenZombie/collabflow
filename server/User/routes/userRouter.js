const express = require('express');
const userRouter = express.Router();
const authController = require('../controller/authController');
const logoutController = require('../controller/logoutController');
const refreshTokenController = require('../controller/refreshTokenController');
const registerController = require('../controller/registerController');
const {userAuthValidation} = require('../validation/user');
const {userRegValidation} = require('../validation/user');

//validation only for registering and authorization things
userRouter.route('/')
.post(userAuthValidation, authController.handleLogin)
.get(logoutController.handleLogout)
.get(refreshTokenController.handleRefreshToken)
.post(userRegValidation, registerController.handleNewUser);

module.exports = userRouter;

