const mongoose = require("mongoose");

// A conversation is a thread between exactly two users.
// We find or create a conversation by sorting both participant IDs
// so (userA, userB) and (userB, userA) always map to the same document.

const conversationSchema = new mongoose.Schema(
    {
        // Always exactly two participants
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            }
        ],

        // The last message — shown in conversation list preview
        lastMessage: {
            text:      { type: String,   default: "" },
            sender:    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
            timestamp: { type: Date,     default: null }
        },

        // Unread count per participant
        // Key is userId string, value is count
        unreadCount: {
            type: Map,
            of: Number,
            default: {}
        }
    },
    { timestamps: true }
);

// Index for fast participant lookup
conversationSchema.index({ participants: 1 });

const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;