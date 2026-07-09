import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';
import ReservationCard from '../components/ReservationCard';
import { Calendar, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

const Reservations = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const endpoint = user.role === 'admin' ? '/admin/reservations' : '/reservations/my';
      const response = await API.get(endpoint);
      if (response.data.success) {
        setReservations(response.data.reservations);
      }
    } catch (error) {
      toast.error('Failed to load reservations list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReservations();
    }
  }, [user]);

  const handleRefresh = () => {
    fetchReservations();
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-zinc-100 font-sans">
            {user?.role === 'admin' ? 'System Reservations' : 'My Reservations Log'}
          </h1>
          <p class="text-zinc-500 text-sm mt-1">
            {user?.role === 'admin' 
              ? 'Complete historical ledger of all customer reservations.' 
              : 'Review and manage your history of dining bookings.'}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          class="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:text-zinc-100 hover:bg-zinc-800 transition-all active:scale-[0.98]"
        >
          <RefreshCw class="h-3.5 w-3.5" />
          Sync
        </button>
      </div>

      {/* Main List */}
      {loading ? (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} class="glass-panel rounded-xl p-5 h-44 animate-pulse space-y-3">
              <div class="h-4 bg-zinc-800 rounded w-1/4" />
              <div class="h-6 bg-zinc-800 rounded w-3/4" />
              <div class="h-4 bg-zinc-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <div class="glass-panel rounded-xl p-16 text-center border border-zinc-850 flex flex-col items-center justify-center">
          <Calendar class="h-12 w-12 text-zinc-700 mb-3" />
          <p class="text-zinc-400 font-medium">No reservations on file</p>
          <p class="text-zinc-650 text-xs mt-1">There are no bookings recorded in your account history.</p>
        </div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservations.map((res) => (
            <ReservationCard
              key={res._id}
              reservation={res}
              onCancel={fetchReservations}
              onDelete={fetchReservations}
              isAdmin={user.role === 'admin'}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Reservations;
