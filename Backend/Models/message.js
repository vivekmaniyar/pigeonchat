const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    message: { type: String, required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat'},
    readby: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
},{
    timestamps: true
});

module.exports = mongoose.model('Message', MessageSchema);