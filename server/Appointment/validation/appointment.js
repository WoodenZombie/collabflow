const {validationResult, body, Result} = require('express-validator');

exports.appointmentValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Appointment title is required')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),

//We use validation in router. And when it comes to to an error it sents error 400
    (req, res, next)=>{
        const result = validationResult(req);
        if (!result.isEmpty()) {
    return res.status(400).json({
        errors: result.array()
    });
  }
        next();
    }
];