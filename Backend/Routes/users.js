const express = require('express');
const router = express.Router();
const UserController = require('../Controllers/UserController');
const checkAuth = require('../Middleware/check-auth');
const inputValidation = require('../Middleware/input-validation');

//Register a new user
router.post('/register', inputValidation.register_validator, UserController.register);

//Login a user
router.post('/login', UserController.login);

//Search user
router.get('/',checkAuth, UserController.searchUser);

module.exports = router;