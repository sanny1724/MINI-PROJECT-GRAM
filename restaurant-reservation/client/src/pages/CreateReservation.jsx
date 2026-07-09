import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import ReservationForm from '../components/ReservationForm';
import FloorPlan from '../components/FloorPlan';
import { CalendarDays, Clock, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const CreateReservation = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(true);
  const [allocatedTableId, setAllocatedTableId] = useState(null);

  // Load tables on mount to feed visual layout plan
  const fetchTables = async () => {
    try {
      const response = await API.get('/tables');
      if (response.data.success) {
        setTables(response.data.tables);
      }
    } catch (error) {
      console.error('Failed to load tables for layout:', error.message);
    } finally {
      setLoadingTables(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleSuccess = (reservation) => {
    // Save allocated table ID to highlight it on layout
    if (reservation?.table?._id) {
      setAllocatedTableId(reservation.table._id);
    }

    // Wait 3 seconds to let user visually appreciate their table allocation, then redirect
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  return (
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Back button */}
      <Link
        to="/dashboard"
        class="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-350 text-xs font-semibold uppercase tracking-wider mb-6 transition-all"
      >
        <ArrowLeft class="h-3.5 w-3.5" />
        Dashboard
      </Link>

      <div class="mb-8">
        <h1 class="text-3xl font-bold text-zinc-100">Reserve Your Table</h1>
        <p class="text-zinc-500 text-sm mt-2 max-w-xl">
          Experience signature gourmet dining. Fill in your booking details below—our algorithm dynamically allocates the smallest optimal table and renders it on the map.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Reservation Form */}
        <div class="lg:col-span-5 glass-panel rounded-2xl p-6 border border-zinc-800/80 self-start">
          <h2 class="text-lg font-bold text-zinc-200 mb-6">Reservation Parameters</h2>
          <ReservationForm onSuccess={handleSuccess} />
        </div>

        {/* Right Column: Visual Layout Floor Plan */}
        <div class="lg:col-span-7 space-y-6">
          <FloorPlan tables={tables} selectedTableId={allocatedTableId} loading={loadingTables} />

          {/* Guidelines info strip */}
          <div class="glass-panel rounded-xl p-5 border border-zinc-800/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 class="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Clock class="h-3.5 w-3.5 text-brand-500" />
                Table Hold Times
              </h3>
              <p class="text-[11px] text-zinc-500 leading-relaxed">
                Tables are held for a grace period of 15 minutes. Past this limit, the slot releases.
              </p>
            </div>
            <div>
              <h3 class="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                <ShieldAlert class="h-3.5 w-3.5 text-brand-500" />
                Clean Cancellation
              </h3>
              <p class="text-[11px] text-zinc-500 leading-relaxed">
                Cancellations release table coordinates instantly to allow bookings from other guests.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateReservation;
