import Reservation from '../models/Reservation.js';
import Table from '../models/Table.js';
import User from '../models/User.js';
import { allocateTable, exceedsMaxCapacity } from '../services/reservationService.js';
import { isPastDateTime, timeToMinutes } from '../utils/timeHelper.js';

// @desc    Get all reservations
// @route   GET /api/admin/reservations
// @access  Private/Admin
export const getAllReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find()
      .populate('table', 'tableNumber capacity')
      .populate('customer', 'name email')
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

// @desc    Get reservations by date
// @route   GET /api/admin/reservations/date/:date
// @access  Private/Admin
export const getReservationsByDate = async (req, res, next) => {
  const { date } = req.params; // YYYY-MM-DD format

  try {
    const reservations = await Reservation.find({ reservationDate: date })
      .populate('table', 'tableNumber capacity')
      .populate('customer', 'name email')
      .sort({ startTime: 1 });

    res.json({
      success: true,
      count: reservations.length,
      reservations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update any reservation (time, capacity, status)
// @route   PUT /api/admin/reservations/:id
// @access  Private/Admin
export const updateReservation = async (req, res, next) => {
  const { reservationDate, startTime, endTime, guestCount, status } = req.body;

  try {
    let reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found',
      });
    }

    // Determine values to update (fallback to existing if not provided)
    const updatedDate = reservationDate || reservation.reservationDate;
    const updatedStart = startTime || reservation.startTime;
    const updatedEnd = endTime || reservation.endTime;
    const updatedGuests = guestCount !== undefined ? Number(guestCount) : reservation.guestCount;
    const updatedStatus = status || reservation.status;

    // Validate times if they changed
    if (startTime || endTime) {
      const startMins = timeToMinutes(updatedStart);
      const endMins = timeToMinutes(updatedEnd);
      if (startMins >= endMins) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time',
        });
      }
    }

    // Allocate table if date, times, guests, or status changes (and status is confirmed)
    let assignedTableId = reservation.table;

    if (
      (reservationDate && reservationDate !== reservation.reservationDate) ||
      (startTime && startTime !== reservation.startTime) ||
      (endTime && endTime !== reservation.endTime) ||
      (guestCount !== undefined && Number(guestCount) !== reservation.guestCount) ||
      (status === 'confirmed' && reservation.status === 'cancelled')
    ) {
      // Validate guest count fits maximum possible table capacity
      if (guestCount !== undefined) {
        const tooLarge = await exceedsMaxCapacity(updatedGuests);
        if (tooLarge) {
          return res.status(400).json({
            success: false,
            message: `Guest count ${updatedGuests} exceeds max table capacity`,
          });
        }
      }

      // Reallocate table, excluding this reservation from overlap checks
      const allocatedTable = await allocateTable(
        updatedDate,
        updatedStart,
        updatedEnd,
        updatedGuests,
        reservation._id
      );

      if (!allocatedTable) {
        return res.status(400).json({
          success: false,
          message: 'No tables available for the selected slot',
        });
      }
      assignedTableId = allocatedTable._id;
    }

    // Apply updates
    reservation.reservationDate = updatedDate;
    reservation.startTime = updatedStart;
    reservation.endTime = updatedEnd;
    reservation.guestCount = updatedGuests;
    reservation.status = updatedStatus;
    reservation.table = assignedTableId;

    await reservation.save();

    const populatedRes = await Reservation.findById(reservation._id)
      .populate('table', 'tableNumber capacity')
      .populate('customer', 'name email');

    res.json({
      success: true,
      message: 'Reservation updated successfully',
      reservation: populatedRes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete (remove) reservation
// @route   DELETE /api/admin/reservations/:id
// @access  Private/Admin
export const deleteReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found',
      });
    }

    await Reservation.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Reservation deleted from system successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard metrics / stats
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
export const getStatistics = async (req, res, next) => {
  try {
    // Current Local Date
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${date}`;

    // Current Local Time
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentHHMM = `${currentHours}:${currentMinutes}`;

    // 1. Today's Bookings
    const todaysReservations = await Reservation.find({
      reservationDate: todayStr,
      status: 'confirmed',
    }).populate('table', 'tableNumber');

    // 2. Cancelled Reservations
    const cancelledCount = await Reservation.countDocuments({ status: 'cancelled' });

    // 3. Total registered users (customers and admins)
    const totalUsers = await User.countDocuments({ role: 'customer' });

    // 4. Calculate Available Tables right now
    // Find all active tables
    const activeTables = await Table.find({ isActive: true });
    const totalActiveTablesCount = activeTables.length;

    // Find tables currently occupied right now (today, status confirmed, current time falls in range)
    // Range overlap check for current time: startTime <= currentHHMM AND endTime > currentHHMM
    const occupiedReservations = await Reservation.find({
      reservationDate: todayStr,
      status: 'confirmed',
      startTime: { $lte: currentHHMM },
      endTime: { $gt: currentHHMM },
    });

    const occupiedTableIds = occupiedReservations.map((res) => res.table.toString());
    const uniqueOccupiedTablesCount = new Set(occupiedTableIds).size;

    const availableTablesCount = Math.max(0, totalActiveTablesCount - uniqueOccupiedTablesCount);

    res.json({
      success: true,
      stats: {
        todaysBookingsCount: todaysReservations.length,
        cancelledCount,
        totalCustomersCount: totalUsers,
        availableTablesCount,
        totalTablesCount: totalActiveTablesCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
