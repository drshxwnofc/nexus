import kv from "../db/kv.js";

export async function rateLimit(key, limit, windowSeconds) {
  const now = Date.now();
  const bucket = Math.floor(now / (windowSeconds * 1000));
  const redisKey = `rl:${key}:${bucket}`;

  const count = await kv.incr(redisKey);
  if (count === 1) {
    await kv.expire(redisKey, windowSeconds);
  }

  return count <= limit;
}
