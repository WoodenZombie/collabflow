const { body, validationResult } = require('express-validator');

exports.appointmentParticipantValidation = [
  body('appointment_id')
    .notEmpty()
    .withMessage('appointment_id is required')
    .isInt()
    .withMessage('appointment_id must be an integer'),

  body('user_id')
    .notEmpty()
    .withMessage('user_id is required')
    .isInt()
    .withMessage('user_id must be an integer'),

  body('attendance_status')
    .optional()
    .isIn(['invited', 'accepted', 'declined'])
    .withMessage('attendance_status must be one of: invited, accepted, declined'),

  body('invited_at')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('invited_at must be a valid date'),

  body('responded_at')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('responded_at must be a valid date'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
