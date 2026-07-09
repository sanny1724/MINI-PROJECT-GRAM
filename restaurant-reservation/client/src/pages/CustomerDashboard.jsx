import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';
import ReservationForm from '../components/ReservationForm';
import ReservationCard from '../components/ReservationCard';
import { Calendar, Users, XCircle, Clock, BookOpen, PlusCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    cancelled: 0,
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchReservations = async () => {
    try {
      const response = await API.get('/reservations/my');
      if (response.data.success) {
        const list = response.data.reservations;
        setReservations(list);
        
        // Calculate stats client side
        const total = list.length;
        const upcoming = list.filter(
          (r) => r.status === 'confirmed' && r.reservationDate >= todayStr
        ).length;
        const cancelled = list.filter((r) => r.status === 'cancelled').length;

        setStats({ total, upcoming, cancelled });
      }
    } catch (error) {
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancelReservation = (id) => {
    // Re-fetch to update stats and list
    fetchReservations();
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div class="mb-8">
        <h1 class="text-3xl font-bold tracking-tight text-zinc-100 font-sans">
          Welcome back, <span class="text-brand-400">{user?.name}</span>
        </h1>
        <p class="text-zinc-500 text-sm mt-1.5">
          Manage your bookings, check table availability, and plan your next dining experience.
        </p>
      </div>

      {/* Stats Section */}
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {/* Total Reservations Card */}
        <div class="glass-panel rounded-xl p-6 flex items-center justify-between">
          <div>
            <p class="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Total Bookings</p>
            <h3 class="text-3xl font-extrabold text-zinc-100 mt-2">
              {loading ? (
                <div class="h-8 w-12 bg-zinc-800 animate-pulse rounded" />
              ) : (
                stats.total
              )}
            </h3>
          </div>
          <div class="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
            <BookOpen class="h-6 w-6 text-brand-500" />
          </div>
        </div>

        {/* Upcoming Reservations Card */}
        <div class="glass-panel rounded-xl p-6 flex items-center justify-between">
          <div>
            <p class="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Upcoming Visits</p>
            <h3 class="text-3xl font-extrabold text-zinc-100 mt-2">
              {loading ? (
                <div class="h-8 w-12 bg-zinc-800 animate-pulse rounded" />
              ) : (
                stats.upcoming
              )}
            </h3>
          </div>
          <div class="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
            <Calendar class="h-6 w-6 text-emerald-500" />
          </div>
        </div>

        {/* Cancelled Reservations Card */}
        <div class="glass-panel rounded-xl p-6 flex items-center justify-between">
          <div>
            <p class="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Cancelled Bookings</p>
            <h3 class="text-3xl font-extrabold text-zinc-100 mt-2">
              {loading ? (
                <div class="h-8 w-12 bg-zinc-800 animate-pulse rounded" />
              ) : (
                stats.cancelled
              )}
            </h3>
          </div>
          <div class="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
            <XCircle class="h-6 w-6 text-zinc-600" />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 columns: Reservations list */}
        <div class="lg:col-span-2 space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-zinc-100">My Reservations</h2>
            <span class="text-xs text-zinc-500 font-mono">
              {!loading && `${reservations.length} total`}
            </span>
          </div>

          {loading ? (
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} class="glass-panel rounded-xl p-5 h-44 animate-pulse space-y-3">
                  <div class="h-4 bg-zinc-800 rounded w-1/4" />
                  <div class="h-6 bg-zinc-800 rounded w-3/4" />
                  <div class="h-4 bg-zinc-800 rounded w-1/2" />
                  <div class="h-4 bg-zinc-800 rounded w-2/3 mt-4" />
                </div>
              ))}
            </div>
          ) : reservations.length === 0 ? (
            <div class="glass-panel rounded-xl p-10 text-center flex flex-col items-center justify-center border border-zinc-850">
              <Calendar class="h-10 w-10 text-zinc-700 mb-3" />
              <p class="text-zinc-400 font-medium">No reservations found</p>
              <p class="text-zinc-650 text-xs mt-1">Book your first table using the form on the right!</p>
            </div>
          ) : (
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {reservations.map((res) => (
                <ReservationCard
                  key={res._id}
                  reservation={res}
                  onCancel={handleCancelReservation}
                  isAdmin={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right column: Book Reservation */}
        <div class="space-y-6">
          <div class="flex items-center gap-2">
            <PlusCircle class="h-5 w-5 text-brand-500" />
            <h2 class="text-xl font-bold text-zinc-100">Reserve a Table</h2>
          </div>

          <div class="glass-panel rounded-xl p-6 border border-zinc-800/80">
            <ReservationForm onSuccess={fetchReservations} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
