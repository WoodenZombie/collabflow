const customError = require('../utils/customError');
//it's for read all information about what happend and what king of error is it. Uses in development mode
const devErrors = (res, error) => {
    res.status(error.statusCode).json({
        status: error.statusCode,
        message: error.message,
        stackTrace: error.stack,
        error: error
    });
}

// this is used for catching invalid ID for project. For e.g. /api/projects/45wt;kjb45wtpiu45ry[98ytrsh809u5ry98yufgn9hu[]] will cause the error :>
const castErrorHandler = (err) => {
    const msg = `Invalid value for ${err.path}: ${err.value} !`;
    return new customError(msg, 400);
}

//it's used for production, that we don't leak too much information for users. Security issues
const prodErrors = (res, error) => {
    //isOperational is from customError and will be used for production mode and by this class we will sent an actual info about error, which we want to provide.
    if (error.isOperational) {
        res.status(error.statusCode).json({
            status: error.statusCode,
            message: error.message
        });
    } else {
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong! Please try again later.',
        })
    }
}
module.exports = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    //checks which mode is active. Check/Edit mode in .env file 
    if (process.env.NODE_ENV === 'development') {
        devErrors(res, error);
    } else if (process.env.NODE_ENV === 'production') {
        if (error.name === 'CastError') error = castErrorHandler(error);
        prodErrors(res, error);
    }
} 