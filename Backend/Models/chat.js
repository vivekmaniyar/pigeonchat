const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
    chatName: { type: String},
    isGroupChat: { type: Boolean, default: false},
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    latestmessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message'},
    groupadmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}
},{
    timestamps: true
});

module.exports = mongoose.model('Chat', ChatSchema);