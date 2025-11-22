const {validationResult, body, Result} = require('express-validator');

//For Team in table teams we can validate only one attribute name, max 100 symbols.
exports.teamValidation = [
    body('name')
    .trim()
    .notEmpty()
    .withMessage('Write name for a new team.')
    .isLength({max: 100})
    .withMessage('Write team name shorter.'),

    
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