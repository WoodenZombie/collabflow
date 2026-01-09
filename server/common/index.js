require('dotenv').config();
const express = require("express");
const app = express();
const cors = require('cors'); // <--- 1. Import cors
const cookieParser = require('cookie-parser');

const customError = require("./utils/customError");
const globalErrorHandler = require("./middleware/errorController");
const projectRouter = require("../Project/routes/project");
const dashboardRoutes = require('./../Dashboard/routes/dashboard');
const verifyJWT = require('../common/middleware/verifyJWT');
const userRouter = require('../User/routes/userRouter');
const auditLogsRouter = require("../AuditLogs/routes/auditLogs");

const ports = process.env.PORT || 3000;

// --- FIXED CORS SETUP ---
// 2. Use the package instead of manual headers
app.use(cors({
    origin: process.env.FRONTEND_URL, // e.g. 'https://my-frontend.vercel.app'
    credentials: true, // Essential for cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// middleware for cookies
app.use(cookieParser());

// json parser
app.use(express.json());

// --- ROUTES ---

// Public Routes (Login, Register, Refresh Token)
// These MUST be before verifyJWT
app.use("/api", userRouter); 

// SECURITY NOTE: Your audit logs are currently public! 
// If they need protection, move this line BELOW verifyJWT.
app.use("/api", auditLogsRouter);

// --- PROTECTED ZONE ---
app.use(verifyJWT); // Blocks anything below this if no valid Token

app.use("/api", projectRouter);
app.use('/api/dashboard', dashboardRoutes);

// Error Handling
app.use((req, res, next) => {
  const err = new customError(`Can't find ${req.originalUrl} on the server`, 404);
  next(err);
});

app.use(globalErrorHandler);

// Vercel Serverless Check
if (process.env.NODE_ENV !== 'production') {
  app.listen(ports, () => {
    console.log(`Server running on ${ports}`);
  });
}

module.exports = app;