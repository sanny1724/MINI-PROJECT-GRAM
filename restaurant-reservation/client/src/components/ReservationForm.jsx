import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import API from '../services/api';
import { Calendar, Clock, Users, ArrowRight, ArrowLeft, CreditCard, Lock, ShieldCheck } from 'lucide-react';

const ReservationForm = ({ onSuccess }) => {
  const [formStep, setFormStep] = useState('details'); // 'details' or 'payment'
  const [bookingDetails, setBookingDetails] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      reservationDate: '',
      startTime: '',
      endTime: '',
      guestCount: 2,
      cardholderName: '',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
    },
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const [isSubmitting, setIsSubmitting] = useState(false);

  // First step: validate details and transition to payment
  const handleNextStep = (data) => {
    // Basic validation: startTime before endTime
    const [startH, startM] = data.startTime.split(':').map(Number);
    const [endH, endM] = data.endTime.split(':').map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;

    if (startMins >= endMins) {
      toast.error('End time must be after start time');
      return;
    }

    if (endMins - startMins < 30) {
      toast.error('Minimum reservation duration is 30 minutes');
      return;
    }

    setBookingDetails(data);
    setFormStep('payment');
  };

  // Final step: simulate payment and submit booking to API
  const handleFinalSubmit = async (data) => {
    setIsSubmitting(true);
    
    // Simulate secure network transaction authorization
    toast.info('Authorizing simulated card transaction...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const response = await API.post('/reservations', {
        reservationDate: bookingDetails.reservationDate,
        startTime: bookingDetails.startTime,
        endTime: bookingDetails.endTime,
        guestCount: parseInt(bookingDetails.guestCount, 10),
      });

      if (response.data.success) {
        toast.success(
          `Success! Allocated Table ${response.data.reservation.table.tableNumber} (Capacity: ${response.data.reservation.table.capacity})`
        );
        reset();
        setFormStep('details');
        setBookingDetails(null);
        if (onSuccess) onSuccess(response.data.reservation);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to request reservation';
      toast.error(message);
      // Fallback to details step if allocation failed
      setFormStep('details');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Progress indicators */}
      <div class="flex items-center justify-between mb-6 text-xs text-zinc-550 border-b border-zinc-850 pb-3 font-semibold uppercase tracking-wider">
        <span class={formStep === 'details' ? 'text-brand-400 font-bold' : 'text-zinc-500'}>1. Dining Details</span>
        <ArrowRight class="h-3.5 w-3.5 text-zinc-700" />
        <span class={formStep === 'payment' ? 'text-brand-400 font-bold' : 'text-zinc-500'}>2. Secure Hold</span>
      </div>

      {formStep === 'details' ? (
        <form onSubmit={handleSubmit(handleNextStep)} class="space-y-6">
          {/* Date */}
          <div>
            <label class="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-1.5">
              <Calendar class="h-4 w-4 text-brand-500" />
              Reservation Date
            </label>
            <input
              type="date"
              min={todayStr}
              {...register('reservationDate', { required: 'Date is required' })}
              class="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-3.5 text-zinc-105 text-zinc-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm"
            />
            {errors.reservationDate && (
              <p class="mt-1 text-xs text-red-500">{errors.reservationDate.message}</p>
            )}
          </div>

          {/* Times */}
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-1.5">
                <Clock class="h-4 w-4 text-brand-500" />
                Arrival Time
              </label>
              <input
                type="time"
                {...register('startTime', { required: 'Start time is required' })}
                class="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-3.5 text-zinc-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm"
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
                {...register('endTime', { required: 'End time is required' })}
                class="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-3.5 text-zinc-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm"
              />
              {errors.endTime && (
                <p class="mt-1 text-xs text-red-500">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          {/* Guests */}
          <div>
            <label class="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-1.5">
              <Users class="h-4 w-4 text-brand-500" />
              Number of Guests
            </label>
            <select
              {...register('guestCount', { required: 'Guest count is required' })}
              class="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-3.5 text-zinc-300 focus:outline-none focus:border-brand-500 transition-all text-sm"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
          </div>

          {/* Next Button */}
          <button
            type="submit"
            class="w-full btn-primary flex items-center justify-center gap-2 mt-4"
          >
            <span>Proceed to Seating Hold</span>
            <ArrowRight class="h-4 w-4" />
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit(handleFinalSubmit)} class="space-y-5">
          {/* Checkout Shield Label */}
          <div class="p-3 bg-brand-950/20 border border-brand-900/30 rounded-lg flex items-start gap-2.5 mb-2">
            <Lock class="h-4 w-4 text-brand-400 shrink-0 mt-0.5" />
            <div class="text-[11px] text-zinc-400 leading-relaxed">
              <span class="font-bold text-zinc-350">Secure Booking Hold:</span> To prevent empty tables, we require a card registration. No charges are applied unless a no-show occurs.
            </div>
          </div>

          {/* Cardholder Name */}
          <div>
            <label class="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Cardholder Name
            </label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              {...register('cardholderName', { required: 'Name is required' })}
              class="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-brand-500 transition-all text-xs font-medium"
            />
          </div>

          {/* Card Number */}
          <div>
            <label class="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <CreditCard class="h-3.5 w-3.5 text-brand-500" />
              Card Number
            </label>
            <input
              type="text"
              maxLength="19"
              placeholder="1111-2222-3333-4444"
              {...register('cardNumber', {
                required: 'Card number is required',
                pattern: { value: /^\d{4}-\d{4}-\d{4}-\d{4}$/, message: 'Use format xxxx-xxxx-xxxx-xxxx' },
              })}
              class="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-brand-500 transition-all text-xs font-mono"
            />
          </div>

          {/* Expiry & CVV */}
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Expiration
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                maxLength="5"
                {...register('cardExpiry', {
                  required: 'Expiry is required',
                  pattern: { value: /^(0[1-9]|1[0-2])\/\d{2}$/, message: 'MM/YY format' },
                })}
                class="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-brand-500 transition-all text-xs font-mono"
              />
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                CVV
              </label>
              <input
                type="password"
                placeholder="•••"
                maxLength="3"
                {...register('cardCvv', {
                  required: 'CVV is required',
                  pattern: { value: /^\d{3}$/, message: '3 digits' },
                })}
                class="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-brand-500 transition-all text-xs font-mono"
              />
            </div>
          </div>

          {/* Secure strip */}
          <div class="flex items-center justify-center gap-1.5 text-[9px] text-emerald-400 uppercase tracking-widest font-bold pt-2">
            <ShieldCheck class="h-3.5 w-3.5" />
            <span>SSL Secured Checkout</span>
          </div>

          {/* Buttons */}
          <div class="flex gap-3 pt-3 border-t border-zinc-850">
            <button
              type="button"
              onClick={() => setFormStep('details')}
              disabled={isSubmitting}
              class="btn-secondary py-2 flex-1 flex items-center justify-center gap-1 text-xs"
            >
              <ArrowLeft class="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              class="btn-primary py-2 flex-2 flex-1 flex items-center justify-center gap-1 text-xs"
            >
              <span>{isSubmitting ? 'Securing Hold...' : 'Confirm Hold'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ReservationForm;
