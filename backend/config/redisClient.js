const { createClient } = require("redis");

const client = createClient({
    url: process.env.REDIS_URL,
    socket: {
        reconnectStrategy: (retries) => {
            // Stop retrying after 3 attempts
            // Return false to stop, or a number (ms) to wait before retry
            if (retries >= 3) {
                console.error("❌ Redis: max retries reached, giving up");
                return false;
            }
            // Wait 2 seconds between retries
            return 2000;
        },
        connectTimeout: 10000  // 10 second timeout
    }
});

client.on("error",   (err) => {
    // Only log the message, not the full stack trace
    console.error("❌ Redis error:", err.message);
});

client.on("connect", () => console.log("✅ Redis connected"));
client.on("ready",   () => console.log("✅ Redis ready"));

client.connect().catch((err) => {
    console.error("❌ Redis failed to connect:", err.message);
});

module.exports = client;