-- Lua script for atomic token bucket rate limiting
local tokens = redis.call('HGET', KEYS[1], 'tokens')
local lastRefill = redis.call('HGET', KEYS[1], 'lastRefill')
local now = tonumber(ARGV[1])
local refillRate = tonumber(ARGV[2])
local rateLimit = tonumber(ARGV[3])

-- Initialize tokens and lastRefill if they are nil
if tokens == false then
    tokens = rateLimit  -- Start with max tokens if no record exists
else
    tokens = tonumber(tokens)  -- Convert to number if it exists
end

if lastRefill == false then
    lastRefill = now  -- Initialize lastRefill to current time if no record exists
else
    lastRefill = tonumber(lastRefill)  -- Convert to number if it exists
end

-- Calculate how many tokens should be added based on elapsed time
local elapsedTime = (now - lastRefill) / 1000
local tokensToAdd = math.floor(elapsedTime * refillRate)
local updatedTokens = math.min(rateLimit, tokens + tokensToAdd)

-- Update Redis with new token and timestamp values
redis.call('HSET', KEYS[1], 'tokens', updatedTokens)
redis.call('HSET', KEYS[1], 'lastRefill', now)

-- Check if there are enough tokens for this request
if updatedTokens > 0 then
    redis.call('HSET', KEYS[1], 'tokens', updatedTokens - 1)
    return updatedTokens - 1  -- Return the number of remaining tokens
else
    return -1  -- Indicate that the rate limit has been exceeded
end
