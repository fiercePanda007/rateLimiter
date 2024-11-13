const express = require("express");
const cors = require("cors");
const rateLimiter = require("./rateLimiter"); // Import rate limiter middleware

const app = express();

// Configure CORS to expose the rate limit headers
app.use(
  cors({
    origin: "*", // Replace with the origin of your frontend
    exposedHeaders: [
      "X-Ratelimit-Remaining",
      "X-Ratelimit-Limit",
      "X-Ratelimit-Retry-After",
    ],
  })
);

// Use the rate limiter middleware
app.use(rateLimiter);

app.get("/api/data", (req, res) => {
  res.send({ message: "Request processed successfully" });
});

app.listen(3000, () => {
  console.log("Middleware server running on port 3000");
});
