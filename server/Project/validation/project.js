
const {validationResult, body, Result} = require('express-validator');

//There is a validation of name(checks if it's not empty and if it didn't reach limits and give a message about error if it's not validated)
exports.projectValidation = [
    body('name')
    .trim()
    .notEmpty()
    .withMessage('Write name of your project')
    .isLength({max: 100})
    .withMessage('Write your name shorter than this'),

    //Validate status if there are 'Planning', 'In Progress', 'Completed'. If it's not them it wouldn't be validated  
    body('status')
    .optional()
    .isIn(['Planning', 'In Progress', 'Completed'])
    .withMessage('Status is invalid'),

    //We use validation in controller. And when it comes to to an error it sents error 400
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