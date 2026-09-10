const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        // Which conversation this message belongs to
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true
        },

        // Who sent it
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // The message text
        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        },

        // Has the recipient read this message?
        read: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

// Fast lookup of all messages in a conversation, sorted by time
messageSchema.index({ conversation: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;