import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import API from '../services/api';
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';

const ReservationForm = ({ onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      reservationDate: '',
      startTime: '',
      endTime: '',
      guestCount: 2,
    },
  });

  // Calculate today's date in YYYY-MM-DD format for client-side constraint
  const todayStr = new Date().toISOString().split('T')[0];

  const handleBooking = async (data) => {
    try {
      const response = await API.post('/reservations', {
        reservationDate: data.reservationDate,
        startTime: data.startTime,
        endTime: data.endTime,
        guestCount: parseInt(data.guestCount, 10),
      });

      if (response.data.success) {
        toast.success(
          `Success! Allocated Table ${response.data.reservation.table.tableNumber} (Capacity: ${response.data.reservation.table.capacity})`
        );
        reset();
        if (onSuccess) onSuccess(response.data.reservation);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to request reservation';
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleBooking)} class="space-y-6">
      {/* Date */}
      <div>
        <label class="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-1.5">
          <Calendar class="h-4 w-4 text-brand-500" />
          Reservation Date
        </label>
        <div class="relative">
          <input
            type="date"
            min={todayStr}
            {...register('reservationDate', {
              required: 'Date is required',
            })}
            class="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-3.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          />
        </div>
        {errors.reservationDate && (
          <p class="mt-1 text-xs text-red-500">{errors.reservationDate.message}</p>
        )}
      </div>

      {/* Time Slots */}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-1.5">
            <Clock class="h-4 w-4 text-brand-500" />
            Arrival Time
          </label>
          <input
            type="time"
            {...register('startTime', {
              required: 'Start time is required',
            })}
            class="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-3.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          />
          {errors.startTime && (
            <p class="mt-1 text-xs text-red-500">{errors.startTime.message}</p>
          )}
        </div>

        <div>
          <label class="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-1.5">
            <Clock class="h-4 w-4 text-brand-500" />
            Departure Time
          </label>
          <input
            type="time"
            {...register('endTime', {
              required: 'End time is required',
            })}
            class="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-3.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          />
          {errors.endTime && (
            <p class="mt-1 text-xs text-red-500">{errors.endTime.message}</p>
          )}
        </div>
      </div>

      {/* Guest Count */}
      <div>
        <label class="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-1.5">
          <Users class="h-4 w-4 text-brand-500" />
          Number of Guests
        </label>
        <select
          {...register('guestCount', {
            required: 'Guest count is required',
            min: { value: 1, message: 'Must have at least 1 guest' },
          })}
          class="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-3.5 text-zinc-100 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <option key={num} value={num}>
              {num} {num === 1 ? 'Guest' : 'Guests'}
            </option>
          ))}
        </select>
        {errors.guestCount && (
          <p class="mt-1 text-xs text-red-500">{errors.guestCount.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        class="w-full btn-primary flex items-center justify-center gap-2 mt-4"
      >
        <span>{isSubmitting ? 'Checking Availability...' : 'Book Reservation'}</span>
        <ArrowRight class="h-4 w-4" />
      </button>
    </form>
  );
};

export default ReservationForm;
