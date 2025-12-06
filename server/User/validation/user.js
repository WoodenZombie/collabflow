const {validationResult, body, Result} = require('express-validator');

exports.userAuthValidation = [
    body('email')
    .trim()
    .notEmpty()
    .withMessage('Write your email.'),
    
    body('password')
    .notEmpty()
    .withMessage('Write your password.'),
    
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

exports.userRegValidation = [
   body('email')
   .trim()
   .notEmpty()
   .withMessage('Enter your email.')
   .isEmail()
   .withMessage('Please enter a valid email address.')
   .isLength({max:150})
   .withMessage('Email shall not exceed 150 characters.')
   .normalizeEmail(),

    body('password')
    .notEmpty()
    .withMessage('Create your password.')
    .isStrongPassword({
    minLength: 10,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
   })
   .withMessage('Password must contain atleast 10 characters and a combination of uppercase and lowercase letters, numbers, and special characters.')
   .isLength({max:255}),

   body('confirmPassword')
   .notEmpty()
   .withMessage('Reapeat your password, please.')
   .custom((value, {req})=>{
    if(value !== req.body.password){
        throw new Error('Passwords do not match. Please, write your password.')
    }
    return true;
   }),
   
   body('name')
   .trim()
   .notEmpty()
   .withMessage('Write your name.')
   .isLength({min:3, max: 100})
   .withMessage('Your name must be 3-100 characters.')
   .matches(/^[\p{L}' \-]+$/u)
   .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes.'),

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