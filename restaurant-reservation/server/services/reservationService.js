import Table from '../models/Table.js';
import Reservation from '../models/Reservation.js';
import { isOverlapping } from '../utils/timeHelper.js';

/**
 * Automatically allocates the smallest available table that can accommodate the guest count
 * and does not conflict with existing reservations for the requested time slot.
 * 
 * @param {string} reservationDate - The date of the reservation (YYYY-MM-DD)
 * @param {string} startTime - The start time (HH:MM)
 * @param {string} endTime - The end time (HH:MM)
 * @param {number} guestCount - Number of guests
 * @param {string} [excludeReservationId] - Optional reservation ID to exclude (used on updates)
 * @returns {Promise<Object|null>} The allocated Table document or null if none available.
 */
export const allocateTable = async (
  reservationDate,
  startTime,
  endTime,
  guestCount,
  excludeReservationId = null
) => {
  // 1. Find all active tables with capacity >= guestCount, sorted by capacity ascending, then tableNumber ascending
  const tables = await Table.find({
    isActive: true,
    capacity: { $gte: guestCount },
  }).sort({ capacity: 1, tableNumber: 1 });

  // 2. Iterate through each table to check for time slot conflicts
  for (const table of tables) {
    const query = {
      table: table._id,
      reservationDate,
      status: { $ne: 'cancelled' },
    };

    // If updating, exclude the reservation itself from the conflict check
    if (excludeReservationId) {
      query._id = { $ne: excludeReservationId };
    }

    const existingReservations = await Reservation.find(query);

    // 3. Detect overlaps in existing reservations for this table
    let hasOverlap = false;
    for (const res of existingReservations) {
      if (isOverlapping(startTime, endTime, res.startTime, res.endTime)) {
        hasOverlap = true;
        break;
      }
    }

    // 4. Return the first table that is free
    if (!hasOverlap) {
      return table;
    }
  }

  // No table available
  return null;
};

/**
 * Checks if the guest count exceeds the maximum capacity of any active table in the restaurant.
 * @param {number} guestCount - Number of guests
 * @returns {Promise<boolean>} True if guest count exceeds max table capacity, false otherwise
 */
export const exceedsMaxCapacity = async (guestCount) => {
  const maxTable = await Table.findOne({ isActive: true }).sort({ capacity: -1 });
  if (!maxTable) return true; // No tables active at all
  return guestCount > maxTable.capacity;
};
