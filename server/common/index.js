require('dotenv').config();
const express = require("express");
const app = express();
const customError = require("./utils/customError");
const globalErrorHandler = require("./middleware/errorController");
const projectRouter = require("../Project/routes/project");
const dashboardRoutes = require('./../Dashboard/routes/dashboard');
const verifyJWT = require('../common/middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const userRouter = require('../User/routes/userRouter');
const ports = process.env.PORT || 3000;
const auditLogsRouter = require("../AuditLogs/routes/auditLogs");

// Enable CORS for frontend communication
app.use((req, res, next) => {
  const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
  res.header("Access-Control-Allow-Origin", allowedOrigin);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

//middleware for cookies. jwt is saved in cookies
app.use(cookieParser());

//it parsed req.body to a readable JSON format
app.use(express.json());

//user router
app.use("/api", userRouter);

//audit logs router
app.use("/api", auditLogsRouter);

//verifying jwt
app.use(verifyJWT);

//to reach router projects, and others you need write /api/projects. It's need for connecting with frontend
app.use("/api", projectRouter);
app.use('/api/dashboard', dashboardRoutes);

//Sents an error if user write invalid url, for e.g. /api/projeghg/3
app.use((req, res, next) => {
  const err = new customError(
    `Can't find ${req.originalUrl} on the server`,
    404
  );
  next(err);
});

//catch errors from errorController in controllers
app.use(globalErrorHandler);

if (process.env.NODE_ENV !== 'production') {
  app.listen(ports, () => {
    console.log(`Server running on ${ports}`);
  });
}

module.exports = app;