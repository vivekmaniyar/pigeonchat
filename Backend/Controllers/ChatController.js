const mongoose = require('mongoose');
const Chat = require('../Models/chat');
const User = require('../Models/user');
const Message = require('../Models/message');
const chatController = require('../Controllers/ChatController');

module.exports.createChat = function(req, res) {
    let users = req.body.users;
    users.push(req.body.userId);

    const chat = new Chat({
        _id: new mongoose.Types.ObjectId(),
        chatName: req.body.chatName,
        isGroupChat: req.body.isGroupChat,
        users: users,
        latestmessage: req.body.latestmessage,
        groupadmin: (req.body.isGroupChat)?(req.body.userId):(null)
    });

    chat.save()
    .then(result=>{
        return result.populate('users groupadmin','name username profileimage email');
    })
    .then(chat=> res.status(201).json(chat))
    .catch(err=>{
        res.status(500).json({
            name: err.name,
            message: err.message
        })
    });

};

module.exports.getChats = function(req, res) {

    Chat.find({
        users: req.body.userId
    })
    .populate('users','name username profileimage email')
    .populate('groupadmin','name username profileimage email')
    .populate('latestmessage','message')
    .exec()
    .then(result => res.status(200).json(result))
    .catch(err=>{
        res.status(500).json({
            name: err.name,
            message: err.message
        });
    });
  
};

module.exports.getChat = function(req, res) {
    var username;

    Chat.findOne({
        isGroupChat: false,
        $and: [
            {users: {$elemMatch: {$eq: req.body.userId}}},
            {users: {$elemMatch: {$eq: req.body.user}}}
        ]
    })
    .populate('users','name username profileimage email')
    .populate('groupadmin','name username profileimage email')
    .populate('latestmessage','message')
    .exec()
    .then(result=>{
        if(result.length === 0){           
            req.body.users = [req.body.user];
            req.body.latestmessage = null;
            req.body.groupadmin = null;
            req.body.isGroupChat = false;

            return User.findById(req.body.user).exec();          
        }else{
            res.status(200).json(result);
            return;
        }
    })
    .then(user=>{
        if(user){
            req.body.chatName = user.username;
            chatController.createChat(req,res);
        }
    })
    .catch(err => {
        res.status(500).json({
            name: err.name,
            message: err.message
        });
    })
};

module.exports.updateChat = function(req, res) {

    Chat.findById(req.params.chatId)
    .populate('users groupadmin','name username profileimage email')
    .populate('latestmessage','message')
    .exec()
    .then(result=>{
        if(result.isGroupChat){
            result.chatName = req.body.chatName;
            return result.save();
        }else{
            res.status(403).json({
                name: "Not allowed",
                message: "Changing name of the private chat is not allowed"
            });
            return;
        }
    })
    .then(chat=>{
        if(chat){
            res.status(200).json(chat);
        }
    })
    .catch(err=>{
        res.status(500).json({
            name: err.name,
            message: err.message
        })
    })
};

module.exports.deleteChat = function(req, res) {
    var chatId = req.params.chatId;
    var adminuserId = req.body.userId;

    Chat.findById(chatId)
    .exec()
    .then(chat=>{
        if(chat.isGroupChat){           
            if(adminuserId.toString() === chat.groupadmin.toString()){
                return Chat.findByIdAndDelete(chatId).exec();
            }
        }else{
            res.status(403).json({
                name:"Not allowed",
                message:"You are not allowed to delete this chat"
            });
            return;
        }
    })
    .then(result=>{
        if(result){
            return Message.deleteMany({chat: chatId}).exec();
        }
    })
    .then(result=>{
        if(result){          
            res.status(204).json();
        }
    })
    .catch(err=>{
        res.status(500).json({
            name: err.name,
            message: err.message
        });
    });
};

module.exports.addUserToChat = function(req, res) {
    var users = req.body.users;
    var userIdList;

    User.find({
        username: {
            $in: users
        }
    })
    .exec()
    .then(users=>{
        userIdList = users;
        return Chat.findById(req.params.chatId)
        .populate('users groupadmin','name username profileimage email')
        .exec();
    })
    .then(chat=>{
        if(chat.groupadmin.equals(req.body.userId)){
            chat.users.push.apply(chat.users,userIdList);
            return chat.save();
        }else{
            res.status(401).json({
                name: "Not authorized",
                message: "You are not allowed to add users"
            });
            return;
        }
    })
    .then(result=>{
        if(result){
            res.status(200).json(result);
        }
    })
    .catch(err=>{
        res.status(500).json({
            name: err.name,
            message: err.message
        });
    });
};

module.exports.removeUserFromChat = function(req, res) {
    var username = req.body.user;
    var selectedUserId;

    User.findOne({
        username: username
    })
    .exec()
    .then(user=>{
        selectedUserId = user._id;
        return Chat.findById(req.params.chatId)
        .populate('users groupadmin','name username profileimage email')
        .exec();
    })
    .then(chat=>{
        if(chat.groupadmin.equals(req.body.userId)){
            chat.users.pop(selectedUserId);
            return chat.save();
        }else{
            res.status(401).json({
                name: "Not authorized",
                message: "You are not allowed remove users from the group"
            });
            return;
        }
    })
    .then(result=>{
        if(result){
            res.status(200).json(result);
        }
    })
    .catch(err=>{
        res.status(500).json({
            name: err.name,
            message: err.message
        });
    })
};
