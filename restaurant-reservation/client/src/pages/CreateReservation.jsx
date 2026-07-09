import React from 'react';
import { useNavigate } from 'react-router-dom';
import ReservationForm from '../components/ReservationForm';
import { CalendarDays, Clock, HelpCircle, ShieldAlert } from 'lucide-react';

const CreateReservation = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Redirect to dashboard after a successful booking to see it in the list
    navigate('/dashboard');
  };

  return (
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-zinc-100">Reserve Your Table</h1>
        <p class="text-zinc-500 text-sm mt-2 max-w-lg mx-auto">
          Experience gourmet dining tailored to your preferences. Select a slot below and we will instantly allocate the best table.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Reservation Form (left 3 columns) */}
        <div class="md:col-span-3 glass-panel rounded-2xl p-6 border border-zinc-800/80">
          <h2 class="text-lg font-bold text-zinc-200 mb-6">Reservation Details</h2>
          <ReservationForm onSuccess={handleSuccess} />
        </div>

        {/* Guidelines / Help Card (right 2 columns) */}
        <div class="md:col-span-2 space-y-6">
          <div class="glass-panel rounded-2xl p-5 border border-zinc-800/50">
            <h3 class="text-sm font-bold text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <ShieldAlert class="h-4.5 w-4.5 text-brand-500" />
              Booking Rules
            </h3>
            
            <ul class="space-y-3.5 text-xs text-zinc-400">
              <li class="flex items-start gap-2.5">
                <Clock class="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
                <span>We hold tables for a maximum of 15 minutes past the start time of your reservation.</span>
              </li>
              <li class="flex items-start gap-2.5">
                <CalendarDays class="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
                <span>Reservations can be booked up to 30 days in advance. Past bookings are automatically rejected.</span>
              </li>
              <li class="flex items-start gap-2.5">
                <HelpCircle class="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
                <span>The system automatically allocates the smallest available table matching your guest count to optimize seating.</span>
              </li>
            </ul>
          </div>

          <div class="p-5 rounded-2xl bg-brand-950/15 border border-brand-900/30">
            <h4 class="text-xs font-bold text-brand-400 uppercase tracking-wider mb-1">Need special arrangements?</h4>
            <p class="text-[11px] text-zinc-400 leading-relaxed">
              If you have groups larger than 10, require wheelchair access, or want to book private dining halls, please contact our guest relation desk directly at <span class="text-brand-350 font-medium">+1 (555) 123-4567</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateReservation;
