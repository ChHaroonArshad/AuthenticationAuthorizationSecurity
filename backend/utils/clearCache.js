const redisClient = require("../config/redisClient");

// ======================================================
// CLEAR CACHE
// Call this after any write operation (create/update/delete)
// so stale data doesn't stay in cache.
//
// Usage:
//   await clearCache("/artwork")
//   → deletes all keys matching cache:/artwork*
//   → covers /artwork, /artwork?page=1, /artwork?category=painting etc.
// ======================================================
const clearCache = async (pattern) => {
    try {
        const fullPattern = `cache:${pattern}*`;

        // SCAN is safe for production (non-blocking unlike KEYS)
        let cursor = 0;
        let deleted = 0;

        do {
            const result = await redisClient.scan(cursor, {
                MATCH: fullPattern,
                COUNT: 100
            });

            cursor = result.cursor;
            const keys = result.keys;

            if (keys.length > 0) {
                await redisClient.del(keys);
                deleted += keys.length;
            }

        } while (cursor !== 0);

        console.log(`🗑 Cache cleared: ${fullPattern} (${deleted} keys)`);

    } catch (err) {
        console.error("clearCache error:", err.message);
    }
};

module.exports = clearCache;