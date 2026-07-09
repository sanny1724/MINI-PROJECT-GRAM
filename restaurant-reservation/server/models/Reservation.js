import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer is required'],
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: [true, 'Table is required'],
    },
    reservationDate: {
      type: String, // Stored as 'YYYY-MM-DD' to prevent timezone issues
      required: [true, 'Reservation date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Please use the date format YYYY-MM-DD'],
    },
    startTime: {
      type: String, // Stored as 'HH:MM' (24-hour format)
      required: [true, 'Start time is required'],
      match: [/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use time format HH:MM (24h)'],
    },
    endTime: {
      type: String, // Stored as 'HH:MM' (24-hour format)
      required: [true, 'End time is required'],
      match: [/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use time format HH:MM (24h)'],
    },
    guestCount: {
      type: Number,
      required: [true, 'Guest count is required'],
      min: [1, 'Must have at least 1 guest'],
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  {
    timestamps: true,
  }
);

const Reservation = mongoose.model('Reservation', reservationSchema);
export default Reservation;
