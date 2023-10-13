const rateLimit = require("express-rate-limit");

// Create a rate limiter with desired options
const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Maximum 50 requests per windowMs
    message: "Too many attempts, please try again later.",
});

module.exports = rateLimiter