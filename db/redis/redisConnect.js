const { createClient } = require("redis");
const RedisStore = require('connect-redis').default;

const redisClient = createClient();

redisClient.connect().catch(console.error)

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});
  
redisClient.on('error', (err) => {
    console.error('Redis Error:', err);
});

let redisStore = new RedisStore({
    client: redisClient,
    prefix: "blog:",
  })

const redisSession = {
    store: redisStore,
    secret: process.env.REDIS_SECRET, // Replace with your own secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true for HTTPS
};

module.exports = {
    sessionObj: redisSession,
    redisClient
}