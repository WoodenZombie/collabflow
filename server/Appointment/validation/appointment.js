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
    .notEmpty()
    .withMessage('Start time is required')
    .isISO8601()
    .toDate()
    .withMessage('Start time must be a valid date'),

  body('task_id')
    .optional()
    .isInt()
    .withMessage('Task ID must be an integer'),

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