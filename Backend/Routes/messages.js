const express = require('express');
const router = express.Router();
const MessageController = require('../Controllers/MessageController');
const checkAuth = require('../Middleware/check-auth');

//Create a new message
router.post('/', checkAuth, MessageController.createMessage);

//Get all messages for a chat
router.get('/:chatId', checkAuth, MessageController.getMessages);

//Update readby for a message
router.put('/:messageId', checkAuth, MessageController.updateReadBy);

module.exports = router;