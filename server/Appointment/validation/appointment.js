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
  .notEmpty()
  .withMessage('Start time is required')
  .matches(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}|\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})$/)
  .withMessage('Start time must be YYYY-MM-DD HH:MM:SS or YYYY-MM-DDTHH:MM:SS')
  .custom(value => {
    const dt = new Date(value);
    if (isNaN(dt.getTime())) {
      throw new Error('Invalid datetime');
    }

    // extra kontrola: reálný date/time
    const [datePart, timePart] = value.includes('T') ? value.split('T') : value.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, second] = timePart.split(':').map(Number);

    const testDate = new Date(year, month - 1, day, hour, minute, second);
    if (
      testDate.getFullYear() !== year ||
      testDate.getMonth() + 1 !== month ||
      testDate.getDate() !== day ||
      testDate.getHours() !== hour ||
      testDate.getMinutes() !== minute ||
      testDate.getSeconds() !== second
    ) {
      throw new Error('Start time must be a valid datetime');
    }

    return true;
  })
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