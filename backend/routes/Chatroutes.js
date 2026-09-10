const express        = require("express");
const router         = express.Router();
const AuthMiddleware = require("../middleware/AuthMiddleware");
const chatController = require("../controllers/Chatcontroller");

// All chat routes require authentication
router.use(AuthMiddleware);

// Get users this person can chat with
router.get("/users", chatController.getChatableUsers);

// Get or create conversation with a user
router.post("/conversation", chatController.getOrCreateConversation);

// Get all conversations for logged-in user
router.get("/conversations", chatController.getUserConversations);

// Get messages in a specific conversation
router.get(
    "/conversations/:conversationId/messages",
    chatController.getMessages
);

module.exports = router;