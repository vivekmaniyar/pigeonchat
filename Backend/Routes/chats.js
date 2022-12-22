const express = require('express');
const Router = express.Router();
const ChatController = require('../Controllers/ChatController');
const checkAuth = require('../Middleware/check-auth');

//Create a new chat
Router.post('/', checkAuth, ChatController.createChat);

//Get all chats for a user
Router.get('/', checkAuth, ChatController.getChats);

// Get a single chat
Router.post('/getchat', checkAuth, ChatController.getChat);

//Update a chat
Router.put('/:chatId', checkAuth, ChatController.updateChat);

//Delete a chat
Router.delete('/:chatId', checkAuth, ChatController.deleteChat);

//Add users to a chat
Router.post('/:chatId', checkAuth, ChatController.addUserToChat);

//Remove a user from a chat
Router.delete('/removeuser/:chatId', checkAuth, ChatController.removeUserFromChat);

module.exports = Router;