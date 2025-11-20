const {validationResult, body, Result} = require('express-validator');

exports.taskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),

  body('priority')
    .optional()
    .isIn(['High', 'Medium', 'Low'])
    .withMessage('Priority is invalid'),
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