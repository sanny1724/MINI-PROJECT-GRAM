import { body, validationResult } from 'express-validator';

// Middleware to check validation results and return errors if they exist
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

export const registerValidationRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').optional().isIn(['customer', 'admin']).withMessage('Role must be either customer or admin'),
];

export const loginValidationRules = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const tableValidationRules = [
  body('tableNumber').isInt({ min: 1 }).withMessage('Table number must be a positive integer'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1 guest'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean value'),
];

export const reservationValidationRules = [
  body('reservationDate')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Reservation date must be in YYYY-MM-DD format'),
  body('startTime')
    .matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM (24-hour) format'),
  body('endTime')
    .matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM (24-hour) format'),
  body('guestCount')
    .isInt({ min: 1 })
    .withMessage('Guest count must be at least 1'),
];
