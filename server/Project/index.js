const express = require('express');
const router = require('./routes/project');
const app = express();
const customError = require('./services/customError');
const globalErrorHandler = require('./controllers/errorController');

const ports = process.env.PORT || 3000;

//it parsed req.body to a readable JSON format  
app.use(express.json());

//to reach router project you need write /api/projects. It's need for connecting with frontend
app.use('/api', router);

//Sents an error if user write invalid url, for e.g. /api/projeghg/3
app.use((req, res, next) => {
    const err = new customError(`Can't find ${req.originalUrl} on the server`, 404);
    next(err);
});

//catch errors from errorController in controllers
app.use(globalErrorHandler);

app.listen(ports, () => {
    console.log(`Example app listening on ${ports}`);
});