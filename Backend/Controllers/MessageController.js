const Message = require('../Models/message');
const Chat = require('../Models/chat');

module.exports.createMessage = function(req, res) {

    const message = new Message({
        message: req.body.message,
        sender: req.body.userId,
        chat: req.body.chatId
    });

    message.save().then(async(result)=>{
        await Chat.findByIdAndUpdate(req.body.chatId,{latestmessage: result._id});
        await result.populate('sender', 'name username profileimage email');
        await result.populate('chat', 'chatName users groupadmin isGroupChat');
        await result.chat.populate('users groupadmin', 'name username profileimage email');

        return result;
    })
    .then(message=>res.status(201).json(message))
    .catch(err=>{
        res.status(500).json({
            name: err.name,
            message: err.message
        });
    });
};

module.exports.getMessages = function(req, res) {

    Message.find({
        chat: req.params.chatId
    })
    .select('_id message sender chat readby')
    .populate('sender','name username')
    .populate('readby','name username')
    .populate('chat','chatName users groupadmin isGroupChat')
    .populate('chat.groupadmin','name username')
    .exec()
    .then(messages=>res.status(200).json(messages))
    .catch(err=>{
        res.status(500).json({
            name: err.name,
            message: err.message
        });
    });
};

module.exports.updateReadBy = function(req, res) {
    let messageId = req.params.messageId;
    let user = req.body.userId;

    Message.findByIdAndUpdate(messageId, {$addToSet: {readby: user}}, {new: true})
    .exec()
    .then(async(message)=>{
        await message.populate('sender', 'name username profileimage email');
        await message.populate('readby', 'name username profileimage email');
        await message.populate('chat', 'chatName users groupadmin isGroupChat');
        await message.chat.populate('users groupadmin', 'name username profileimage email');

        return message;
    })
    .then(result=>res.status(200).json(result))
    .catch(err=>{
        res.status(500).json({
            name: err.name,
            message: err.message
        });
    });
};
