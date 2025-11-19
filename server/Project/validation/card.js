const { body } = require('express-validator');

exports.cardValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),

  body('listId')
    .isInt({ min: 1 })
    .withMessage('listId must be a positive integer'),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),

  body('position')
    .optional()
    .isInt({ min: 0 })
    .withMessage('position must be a non-negative integer')
];