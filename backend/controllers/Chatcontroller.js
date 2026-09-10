const chatService = require("../services/Chatservice");

// ======================================================
// GET OR CREATE CONVERSATION with another user
// POST /chat/conversation  { recipientId }
// ======================================================
const getOrCreateConversation = async (req, res, next) => {
    try {
        const { recipientId } = req.body;

        if (!recipientId) {
            return res.status(400).json({ message: "recipientId is required" });
        }

        if (recipientId === req.user._id.toString()) {
            return res.status(400).json({ message: "You cannot chat with yourself" });
        }

        const conversation = await chatService.getOrCreateConversation(
            req.user._id,
            recipientId
        );

        res.status(200).json({
            message: "Conversation ready",
            data: conversation
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// GET ALL CONVERSATIONS for logged-in user
// GET /chat/conversations
// ======================================================
const getUserConversations = async (req, res, next) => {
    try {
        const conversations = await chatService.getUserConversations(req.user._id);

        res.status(200).json({
            message: "Conversations fetched",
            data: conversations
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// GET MESSAGES in a conversation
// GET /chat/conversations/:conversationId/messages
// ======================================================
const getMessages = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const page  = Number(req.query.page)  || 1;
        const limit = Number(req.query.limit) || 50;

        const result = await chatService.getMessages(conversationId, page, limit);

        // Mark messages as read when fetched
        await chatService.markAsRead(conversationId, req.user._id);

        res.status(200).json({
            message: "Messages fetched",
            data:    result.messages,
            meta:    { total: result.total, page, limit }
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// GET CHATABLE USERS — who can this user start a chat with
// GET /chat/users
// ======================================================
const getChatableUsers = async (req, res, next) => {
    try {
        const users = await chatService.getChatableUsers(req.user);

        res.status(200).json({
            message: "Users fetched",
            data: users
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getOrCreateConversation,
    getUserConversations,
    getMessages,
    getChatableUsers
};