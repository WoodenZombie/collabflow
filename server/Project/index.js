const express = require('express');
const router = require('./routes/project');
const app = express();
const customError = require('./services/customError');
const globalErrorHandler = require('./controllers/errorController');

const ports = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', router);

app.use((req, res, next) => {
    const err = new customError(`Can't find ${req.originalUrl} on the server`, 404);
    next(err);
});
app.use(globalErrorHandler);

app.listen(ports, () => {
    console.log(`Example app listening on ${ports}`);
});