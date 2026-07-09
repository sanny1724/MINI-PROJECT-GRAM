import express from 'express';
import { register, login, getProfile } from '../controllers/authController.js';
import { registerValidationRules, loginValidationRules, validate } from '../middlewares/validation.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Public Routes
router.post('/register', registerValidationRules, validate, register);
router.post('/login', loginValidationRules, validate, login);

// Private Routes
router.get('/profile', protect, getProfile);

export default router;
