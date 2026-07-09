import express from 'express';
import {
  getAllReservations,
  getReservationsByDate,
  updateReservation,
  deleteReservation,
  getStatistics,
} from '../controllers/adminController.js';
import { protect, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Apply auth and admin protections to all routes in this file
router.use(protect);
router.use(isAdmin);

router.get('/reservations', getAllReservations);
router.get('/reservations/date/:date', getReservationsByDate);
router.put('/reservations/:id', updateReservation);
router.delete('/reservations/:id', deleteReservation);
router.get('/dashboard/stats', getStatistics);

export default router;
