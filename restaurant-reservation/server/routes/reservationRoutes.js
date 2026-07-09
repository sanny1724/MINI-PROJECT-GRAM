import express from 'express';
import { createReservation, getMyReservations, cancelReservation } from '../controllers/reservationController.js';
import { reservationValidationRules, validate } from '../middlewares/validation.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// All routes here require authentication
router.use(protect);

router.post('/', reservationValidationRules, validate, createReservation);
router.get('/my', getMyReservations);
router.delete('/:id', cancelReservation);

export default router;
