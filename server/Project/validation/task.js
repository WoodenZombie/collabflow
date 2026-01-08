const {validationResult, body, Result} = require('express-validator');
const validStatuses = ['Pending', 'In Progress', 'Completed'];
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

  body('status_id')
    .optional()
    .isString()
    .withMessage('Status id must be a string')
    .isIn(['Pending', 'In Progress', 'Completed'])
    .withMessage('Invalid status id. Allowed: Pending, In Progress, Completed'),
  
  body('team_id')
    .exists().withMessage('team id is required')
    .isInt({ min: 1 }).withMessage('team id must be a positive integer'),

  body('status_id')
    .optional()
    .isString().withMessage('status_id must be a string')
    .isIn(validStatuses)
    .withMessage(`Invalid status id. Allowed: ${validStatuses.join(', ')}`),

  body('due_date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('due date must be in YYYY-MM-DD format')
    .custom(value => {
      const d = new Date(value);
      if (isNaN(d.getTime()) || d.toISOString().split('T')[0] !== value) {
        throw new Error('due date must be a valid date');
      }
      return true;
    }),

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