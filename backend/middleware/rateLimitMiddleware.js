const redisClient = require("../config/redisClient");

// ======================================================
// REDIS-BACKED RATE LIMITER
// Tracks how many requests each IP makes per window.
// Stored in Redis so it works across multiple server instances.
//
// Usage:
//   rateLimit({ windowSec: 60, max: 100 })
//   → max 100 requests per IP per 60 seconds
// ======================================================
const rateLimit = ({ windowSec = 60, max = 100, message } = {}) => {
    return async (req, res, next) => {
        // Use IP as the key — each IP gets its own counter
        const ip  = req.ip || req.headers["x-forwarded-for"] || "unknown";
        const key = `ratelimit:${ip}:${req.path}`;

        try {
            // Increment the counter for this IP
            const count = await redisClient.incr(key);

            // On first request, set the expiry window
            if (count === 1) {
                await redisClient.expire(key, windowSec);
            }

            // Tell the client how many requests they have left
            res.setHeader("X-RateLimit-Limit",     max);
            res.setHeader("X-RateLimit-Remaining", Math.max(0, max - count));
            res.setHeader("X-RateLimit-Reset",     windowSec);

            if (count > max) {
                return res.status(429).json({
                    message: message || `Too many requests. Try again in ${windowSec} seconds.`
                });
            }

            next();

        } catch (err) {
            // If Redis is down, don't block requests
            console.error("Rate limit error:", err.message);
            next();
        }
    };
};

module.exports = rateLimit;