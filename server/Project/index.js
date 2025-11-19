const express = require("express");
const projectRouter = require("./routes/project");
const cardRouter = require("./routes/card");
const customError = require("./services/customError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

// Enable CORS for frontend communication
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Parse JSON request body
app.use(express.json());

// Register API routes
app.use("/api", projectRouter);
app.use("/api", cardRouter);

// Handle unknown routes (404)
app.use((req, res, next) => {
  const err = new customError(`Can't find ${req.originalUrl} on this server`, 404);
  next(err);
});

// Global error handler
app.use(globalErrorHandler);

// Start server only when not running tests
if (process.env.NODE_ENV !== "test") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

// Export app for testing (required for Jest + Supertest)
module.exports = app;