const express = require("express");
const app = express();
const customError = require("./utils/customError");
const globalErrorHandler = require("./middleware/errorController");
const projectRouter = require("../Project/routes/project");
const teamRouter = require('../Team/routes/team');
const appointmentsRouter = require('../Appointment/routes/appointment')

const ports = process.env.PORT || 3000;

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

//it parsed req.body to a readable JSON format
app.use(express.json());

//to reach router projects, teams and others you need write /api/projects. It's need for connecting with frontend
app.use("/api", projectRouter);
app.use('/api', teamRouter);
// app.use('/api', appointmentsRouter);

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

app.listen(ports, () => {
  console.log(`Example app listening on ${ports}`);
});
