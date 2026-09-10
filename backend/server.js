const http        = require("http");
const { Server }  = require("socket.io");
const app         = require("./app");
const initSocket  = require("./socket/socketHandler");

require("dotenv").config();

const PORT = process.env.PORT || 3000;

// ── Create HTTP server wrapping Express ──────────────
// Socket.IO needs the raw HTTP server, not the Express app directly
const httpServer = http.createServer(app);

// ── Attach Socket.IO ─────────────────────────────────
const io = new Server(httpServer, {
    cors: {
        origin:      "http://localhost:5173",
        credentials: true,
        methods:     ["GET", "POST"]
    },
    // Ping timeout/interval for detecting disconnects
    pingTimeout:  60000,
    pingInterval: 25000
});

// ── Initialize all socket event handlers ─────────────
initSocket(io);

// ── Start server ─────────────────────────────────────
httpServer.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Socket.IO attached`);
});