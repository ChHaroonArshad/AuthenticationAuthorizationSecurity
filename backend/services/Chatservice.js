const Conversation = require("../models/Conversation");
const Message      = require("../models/Message");
const User         = require("../models/User");

// ======================================================
// GET OR CREATE CONVERSATION between two users
// Sorting IDs ensures (A,B) and (B,A) find the same doc
// ======================================================
const getOrCreateConversation = async (userIdA, userIdB) => {
    const sorted = [userIdA, userIdB].sort();

    let conversation = await Conversation.findOne({
        participants: { $all: sorted }
    }).populate("participants", "name email role");

    if (!conversation) {
        conversation = await Conversation.create({
            participants: sorted
        });
        conversation = await Conversation.findById(conversation._id)
            .populate("participants", "name email role");
    }

    return conversation;
};


// ======================================================
// GET ALL CONVERSATIONS for a user
// ======================================================
const getUserConversations = async (userId) => {
    const conversations = await Conversation.find({
        participants: userId
    })
        .populate("participants", "name email role")
        .populate("lastMessage.sender", "name")
        .sort({ updatedAt: -1 });

    return conversations;
};


// ======================================================
// GET MESSAGES in a conversation — paginated
// ======================================================
const getMessages = async (conversationId, page = 1, limit = 50) => {
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversation: conversationId })
        .populate("sender", "name role")
        .sort({ createdAt: 1 })   // oldest first
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await Message.countDocuments({ conversation: conversationId });

    return { messages, total, page, limit };
};


// ======================================================
// SAVE A MESSAGE + update conversation lastMessage
// ======================================================
const saveMessage = async (conversationId, senderId, text) => {
    // Create the message
    const message = await Message.create({
        conversation: conversationId,
        sender:       senderId,
        text
    });

    // Populate sender for immediate use in socket emit
    const populated = await Message.findById(message._id)
        .populate("sender", "name role");

    // Update conversation's lastMessage + updatedAt
    await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: {
            text:      text,
            sender:    senderId,
            timestamp: new Date()
        },
        // Increment unread for other participant
        $inc: { [`unreadCount.${senderId}`]: 0 }  // sender reads their own
    });

    return populated;
};


// ======================================================
// MARK MESSAGES AS READ
// ======================================================
const markAsRead = async (conversationId, userId) => {
    await Message.updateMany(
        { conversation: conversationId, sender: { $ne: userId }, read: false },
        { read: true }
    );

    // Reset unread count for this user
    await Conversation.findByIdAndUpdate(conversationId, {
        [`unreadCount.${userId}`]: 0
    });
};


// ======================================================
// GET USERS to start a chat with
// Buyers see sellers, sellers see buyers, admins see all
// ======================================================
const getChatableUsers = async (requestingUser) => {
    let filter = {
        _id: { $ne: requestingUser._id }  // exclude self
    };

    if (requestingUser.role === "buyer") {
        // Buyers can message sellers and admins
        filter.role = { $in: ["seller", "admin"] };
    } else if (requestingUser.role === "seller") {
        // Sellers can message buyers and admins
        filter.role = { $in: ["buyer", "admin"] };
    }
    // Admin can message everyone — no role filter

    const users = await User.find(filter)
        .select("name email role")
        .sort({ name: 1 });

    return users;
};


module.exports = {
    getOrCreateConversation,
    getUserConversations,
    getMessages,
    saveMessage,
    markAsRead,
    getChatableUsers
};