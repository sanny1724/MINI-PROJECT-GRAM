import Reservation from '../models/Reservation.js';
import Table from '../models/Table.js';
import { allocateTable, exceedsMaxCapacity } from '../services/reservationService.js';
import { isPastDateTime, timeToMinutes } from '../utils/timeHelper.js';

// @desc    Create a new reservation
// @route   POST /api/reservations
// @access  Private/Customer
export const createReservation = async (req, res, next) => {
  const { reservationDate, startTime, endTime, guestCount } = req.body;
  const customerId = req.user.id;

  try {
    // 1. Prevent past date/time booking
    if (isPastDateTime(reservationDate, startTime)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book reservations in the past',
      });
    }

    // 2. Validate time duration (startTime must be before endTime)
    const startMins = timeToMinutes(startTime);
    const endMins = timeToMinutes(endTime);
    if (startMins >= endMins) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time',
      });
    }

    // 3. Prevent booking durations that are unreasonably long or short (optional quality check, e.g. at least 30 mins)
    if (endMins - startMins < 30) {
      return res.status(400).json({
        success: false,
        message: 'Minimum booking duration is 30 minutes',
      });
    }

    // 4. Validate guest count fits maximum possible table capacity
    const tooLarge = await exceedsMaxCapacity(guestCount);
    if (tooLarge) {
      return res.status(400).json({
        success: false,
        message: `Our largest table cannot accommodate ${guestCount} guests. Please contact the restaurant directly.`,
      });
    }

    // 5. Run availability algorithm
    const allocatedTable = await allocateTable(reservationDate, startTime, endTime, guestCount);

    if (!allocatedTable) {
      return res.status(400).json({
        success: false,
        message: 'No tables available for selected slot',
      });
    }

    // 6. Create reservation
    const reservation = await Reservation.create({
      customer: customerId,
      table: allocatedTable._id,
      reservationDate,
      startTime,
      endTime,
      guestCount,
      status: 'confirmed',
    });

    // Populate table details for return response
    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('table', 'tableNumber capacity')
      .populate('customer', 'name email');

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      reservation: populatedReservation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's reservations
// @route   GET /api/reservations/my
// @access  Private/Customer
export const getMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ customer: req.user.id })
      .populate('table', 'tableNumber capacity')
      .sort({ reservationDate: -1, startTime: -1 });

    res.json({
      success: true,
      count: reservations.length,
      reservations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a reservation
// @route   DELETE /api/reservations/:id
// @access  Private/Customer
export const cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found',
      });
    }

    // Check ownership (only the customer who created it or admin can cancel)
    if (reservation.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this reservation',
      });
    }

    // Update status to cancelled
    reservation.status = 'cancelled';
    await reservation.save();

    res.json({
      success: true,
      message: 'Reservation cancelled successfully',
      reservation,
    });
  } catch (error) {
    next(error);
  }
};
