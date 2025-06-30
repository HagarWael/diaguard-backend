const redis = require("async-redis");
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const client = redis.createClient(redisUrl);
const expirationTime = 600;

async function setUserProfile(key, data) {
  return await set(key, JSON.stringify(data));
}

async function getUserProfile(key) {
  const data = await get(key);
  return data ? JSON.parse(data) : null;
}
async function clearUserProfile(key) {
  return await clear(key);
}
async function set(key, data) {
  await client.setex(key, expirationTime, data);
}

async function get(key) {
  return await client.get(key);
}

async function clear(key) {
  return await client.del(key);
}

module.exports = { setUserProfile, getUserProfile, clearUserProfile };
