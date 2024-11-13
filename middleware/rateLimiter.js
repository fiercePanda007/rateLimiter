const redis = require("redis");
const fs = require("fs");
const path = require("path");

// Initialize Redis client
const client = redis.createClient();
client.connect(); // Ensure the client is connected

const RATE_LIMIT = 100; // Max tokens
const REFILL_RATE = 100; // Tokens added per second
const WINDOW_SIZE = 60 * 1000; // Window size in milliseconds

// Load Lua script from file
const luaScript = fs.readFileSync(
  path.join(__dirname, "rateLimiter.lua"),
  "utf8"
);

const rateLimiter = async (req, res, next) => {
  const key = req.ip;
  const now = Date.now();

  try {
    const remainingTokens = await client.eval(luaScript, {
      keys: [key],
      arguments: [String(now), String(REFILL_RATE), String(RATE_LIMIT)],
    });

    if (remainingTokens >= 0) {
      res.set({
        "X-Ratelimit-Remaining": remainingTokens,
        "X-Ratelimit-Limit": RATE_LIMIT,
      });
      return next();
    } else {
      const retryAfter = Math.ceil(1 / REFILL_RATE);
      res.set({
        "X-Ratelimit-Remaining": 0,
        "X-Ratelimit-Limit": RATE_LIMIT,
        "X-Ratelimit-Retry-After": retryAfter,
      });
      return res.status(429).send("Rate limit exceeded");
    }
  } catch (error) {
    console.error("Error executing Lua script:", error);
    return res.status(500).send("Internal Server Error");
  }
};

module.exports = rateLimiter;
