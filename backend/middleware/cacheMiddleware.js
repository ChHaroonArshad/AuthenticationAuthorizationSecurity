const redisClient = require("../config/redisClient");

// How long to cache responses (in seconds)
const DEFAULT_TTL = 60; // 1 minute

// ======================================================
// CACHE MIDDLEWARE
// Caches GET responses in Redis.
// Key = the full request URL (e.g. /artwork?page=1&limit=12)
// If cache HIT → return cached data immediately (no DB call)
// If cache MISS → let route run, intercept response, cache it
// ======================================================
const cache = (ttl = DEFAULT_TTL) => {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== "GET") return next();

        const key = `cache:${req.originalUrl}`;

        console.log("Key:", key)
        console.log("Res", res)

        try {
            const cached = await redisClient.get(key);

            if (cached) {
                // CACHE HIT — return immediately
                console.log(`🟢 Cache HIT: ${key}`);
                return res.status(200).json(JSON.parse(cached));
            }

            // CACHE MISS — intercept res.json to store before sending
            console.log(`🔴 Cache MISS: ${key}`);

            const originalJson = res.json.bind(res);
            console.log("Original json", originalJson)

            res.json = async (data) => {
                // Only cache successful responses
                if (res.statusCode === 200) {
                    await redisClient.setEx(key, ttl, JSON.stringify(data));
                }
                return originalJson(data);
            };
             console.log("Original json after the function", originalJson)

            next();

        } catch (err) {
            // If Redis is down, just skip caching and serve normally
            console.error("Cache middleware error:", err.message);
            next();
        }
    };
};

module.exports = cache;