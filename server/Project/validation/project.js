
const {validationResult, body, Result} = require('express-validator');

exports.projectValidation = [
    body('name')
    .trim()
    .notEmpty()
    .withMessage('Write name of your project')
    .isLength({max: 100})
    .withMessage('Write your name shoroter than this'),
    
    body('status')
    .optional()
    .isIn(['Planning', 'In Progress', 'Completed'])
    .withMessage('Status is invalid'),

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