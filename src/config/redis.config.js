const redis = require("redis");

const useRedis = redis.createClient({ url: process.env.REDIS_URL });
useRedis.on("error", (error) => {
  console.log(`something error in redis ${error}`);
});

useRedis.on("connect", () => {
  console.log(`the redis is running now you can use it`);
});

if (process.env.NODE_ENV !== "test") {
  useRedis.connect();
}

module.exports = useRedis;