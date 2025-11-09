class CustomError extends Error {
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
        this.status = statusCode >=400 && statusCode < 500 ? 'fail' : 'error';
        // Class and isOperational are for errors, which we can predict. For e.g. When user was creating project he didn't write name and it's an operational error.  
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
};

module.exports = CustomError;