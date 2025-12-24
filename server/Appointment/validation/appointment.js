const {validationResult, body, Result} = require('express-validator');

exports.appointmentValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Appointment title is required')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),

  body('location')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Location must not exceed 255 characters'),

  body('start_time')
    .trim()
    .notEmpty().withMessage('Start time is required')
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('Start time must include time in format YYYY-MM-DDTHH:MM:SS (e.g. 2025-05-01T10:30:00)')
    .toDate(),

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