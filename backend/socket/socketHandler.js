const jwt          = require("jsonwebtoken");
const User         = require("../models/User");
const chatService  = require("../services/Chatservice");

// ======================================================
// SOCKET AUTH MIDDLEWARE
// Verifies JWT from socket handshake before connection
// ======================================================
const socketAuth = async (socket, next) => {
    try {
        // Token sent from frontend as: socket = io(URL, { auth: { token } })
        const token = socket.handshake.auth?.token;

        if (!token) {
            return next(new Error("Authentication required"));
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user    = await User.findById(payload.userID).select("name email role");

        if (!user) {
            return next(new Error("User not found"));
        }

        // Attach user to socket so all event handlers can use socket.user
        socket.user = user;
        next();

    } catch (error) {
        next(new Error("Invalid token"));
    }
};


// ======================================================
// MAIN SOCKET HANDLER
// Called once with the io instance from server.js
// ======================================================
const initSocket = (io) => {

    // Apply auth middleware to every connection
    io.use(socketAuth);

    io.on("connection", (socket) => {
        const user = socket.user;
        console.log(`✅ Socket connected: ${user.name} (${user.role})`);

        // ── JOIN personal room ──────────────────────────
        // Each user joins a room named after their own ID.
        // This lets us emit to a specific user from anywhere:
        //   io.to(userId).emit("event", data)
        socket.join(user._id.toString());

        // ── JOIN CONVERSATION room ──────────────────────
        // When a user opens a conversation, they join that room.
        // Messages in that room go to both participants in real time.
        socket.on("join_conversation", async ({ conversationId }) => {
            socket.join(conversationId);
            console.log(`${user.name} joined conversation ${conversationId}`);

            // Mark messages as read when joining
            await chatService.markAsRead(conversationId, user._id);

            // Tell sender that messages were read
            socket.to(conversationId).emit("messages_read", {
                conversationId,
                readBy: user._id.toString()
            });
        });

        // ── LEAVE CONVERSATION room ─────────────────────
        socket.on("leave_conversation", ({ conversationId }) => {
            socket.leave(conversationId);
        });

        // ── SEND MESSAGE ────────────────────────────────
        socket.on("send_message", async ({ conversationId, text }) => {
            try {
                if (!text || !text.trim()) return;
                if (text.length > 2000) return;

                // Save to database
                const message = await chatService.saveMessage(
                    conversationId,
                    user._id,
                    text.trim()
                );

                // Emit to everyone in the conversation room (including sender)
                // This ensures the sender sees their own message confirmed
                io.to(conversationId).emit("new_message", {
                    message,
                    conversationId
                });

                // Also emit conversation list update to both participants
                // so the sidebar preview updates in real time
                io.to(conversationId).emit("conversation_updated", {
                    conversationId,
                    lastMessage: {
                        text:      text.trim(),
                        sender:    user._id,
                        timestamp: new Date()
                    }
                });

            } catch (error) {
                socket.emit("message_error", { error: "Failed to send message" });
            }
        });

        // ── TYPING INDICATOR ────────────────────────────
        socket.on("typing_start", ({ conversationId }) => {
            // Broadcast to everyone in the room EXCEPT the sender
            socket.to(conversationId).emit("user_typing", {
                userId: user._id.toString(),
                name:   user.name
            });
        });

        socket.on("typing_stop", ({ conversationId }) => {
            socket.to(conversationId).emit("user_stopped_typing", {
                userId: user._id.toString()
            });
        });

        // ── DISCONNECT ──────────────────────────────────
        socket.on("disconnect", () => {
            console.log(`❌ Socket disconnected: ${user.name}`);
        });
    });
};

module.exports = initSocket;