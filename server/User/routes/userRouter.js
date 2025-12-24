const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const logoutController = require('../controller/logoutController');
const refreshTokenController = require('../controller/refreshTokenController');
const registerController = require('../controller/registerController');
const {userAuthValidation} = require('../validation/user');
const {userRegValidation} = require('../validation/user');
const oauthController = require('../controller/oauthController');
const { oauthValidation } = require('../validation/user');

//validation only for registering and authorization things
router
.post('/auth', userAuthValidation, authController.handleLogin)
.get('/logout', logoutController.handleLogout)
.get('/refresh', refreshTokenController.handleRefreshToken)
.post('/register', userRegValidation, registerController.handleNewUser)
.post('/oauth/google', oauthValidation, oauthController.handleGoogleOAuth);
  
module.exports = router;

