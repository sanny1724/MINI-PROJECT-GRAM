import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ReservationCard from '../components/ReservationCard';
import { Calendar, Users, XCircle, Grid, Filter, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState({
    todaysBookingsCount: 0,
    cancelledCount: 0,
    totalCustomersCount: 0,
    availableTablesCount: 0,
    totalTablesCount: 0,
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch Dashboard Statistics
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await API.get('/admin/dashboard/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error.message);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Reservations (filtered or all)
  const fetchReservations = async (dateFilter = '') => {
    setLoading(true);
    try {
      let endpoint = '/admin/reservations';
      if (dateFilter) {
        endpoint = `/admin/reservations/date/${dateFilter}`;
      }
      const response = await API.get(endpoint);
      if (response.data.success) {
        setReservations(response.data.reservations);
      }
    } catch (error) {
      toast.error('Failed to load reservations log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchReservations();
  }, []);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    fetchReservations(newDate);
  };

  const handleClearFilter = () => {
    setSelectedDate('');
    fetchReservations('');
  };

  const handleCancelOrDelete = () => {
    // Refresh stats and lists when a reservation is modified
    fetchStats();
    fetchReservations(selectedDate);
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-zinc-100 font-sans">
            Admin <span class="text-brand-400">Cockpit</span>
          </h1>
          <p class="text-zinc-500 text-sm mt-1">
            Real-time restaurant operational control, table load, and bookings log.
          </p>
        </div>
        <div>
          <button
            onClick={() => {
              fetchStats();
              fetchReservations(selectedDate);
              toast.info('Data refreshed');
            }}
            class="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:text-zinc-100 hover:bg-zinc-800 transition-all active:scale-[0.98]"
          >
            <RefreshCw class="h-3.5 w-3.5" />
            Refresh Panel
          </button>
        </div>
      </div>

      {/* Stats Cockpit Grid */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Today's Bookings */}
        <div class="glass-panel rounded-xl p-5 flex items-center justify-between border-t-2 border-t-brand-500">
          <div>
            <p class="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Today's Bookings</p>
            <h3 class="text-2xl font-extrabold text-zinc-100 mt-1">
              {statsLoading ? (
                <div class="h-7 w-12 bg-zinc-800 animate-pulse rounded" />
              ) : (
                stats.todaysBookingsCount
              )}
            </h3>
          </div>
          <div class="p-2.5 bg-zinc-950/60 rounded-lg border border-zinc-850">
            <Calendar class="h-5 w-5 text-brand-500" />
          </div>
        </div>

        {/* Available Tables */}
        <div class="glass-panel rounded-xl p-5 flex items-center justify-between border-t-2 border-t-emerald-500">
          <div>
            <p class="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Available Tables (Now)</p>
            <h3 class="text-2xl font-extrabold text-zinc-100 mt-1">
              {statsLoading ? (
                <div class="h-7 w-12 bg-zinc-800 animate-pulse rounded" />
              ) : (
                `${stats.availableTablesCount} / ${stats.totalTablesCount}`
              )}
            </h3>
          </div>
          <div class="p-2.5 bg-zinc-950/60 rounded-lg border border-zinc-850">
            <Grid class="h-5 w-5 text-emerald-500" />
          </div>
        </div>

        {/* Cancelled Bookings */}
        <div class="glass-panel rounded-xl p-5 flex items-center justify-between border-t-2 border-t-red-900/60">
          <div>
            <p class="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Cancelled Bookings</p>
            <h3 class="text-2xl font-extrabold text-zinc-100 mt-1">
              {statsLoading ? (
                <div class="h-7 w-12 bg-zinc-800 animate-pulse rounded" />
              ) : (
                stats.cancelledCount
              )}
            </h3>
          </div>
          <div class="p-2.5 bg-zinc-950/60 rounded-lg border border-zinc-850">
            <XCircle class="h-5 w-5 text-zinc-500" />
          </div>
        </div>

        {/* Registered Customers */}
        <div class="glass-panel rounded-xl p-5 flex items-center justify-between border-t-2 border-t-indigo-500">
          <div>
            <p class="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Total Customers</p>
            <h3 class="text-2xl font-extrabold text-zinc-100 mt-1">
              {statsLoading ? (
                <div class="h-7 w-12 bg-zinc-800 animate-pulse rounded" />
              ) : (
                stats.totalCustomersCount
              )}
            </h3>
          </div>
          <div class="p-2.5 bg-zinc-950/60 rounded-lg border border-zinc-850">
            <Users class="h-5 w-5 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Main Reservation Log Filter Controls */}
      <div class="glass-panel rounded-xl p-6 mb-8 border border-zinc-800/80">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <Filter class="h-5 w-5 text-brand-500" />
            <h2 class="text-lg font-bold text-zinc-200">Filter Bookings Log</h2>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <div class="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                class="bg-zinc-900 border border-zinc-800 text-zinc-250 text-zinc-200 text-sm rounded-lg focus:outline-none focus:border-brand-500 py-2 px-4 select-none"
              />
            </div>
            {selectedDate && (
              <button
                onClick={handleClearFilter}
                class="px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-zinc-100 bg-zinc-800 rounded-lg transition-all"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reservations List */}
      <div>
        <h2 class="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
          <span>Reservations Log</span>
          {!loading && (
            <span class="text-xs font-semibold bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-mono">
              {reservations.length} Bookings
            </span>
          )}
        </h2>

        {loading ? (
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 5, 6].map((i) => (
              <div key={i} class="glass-panel rounded-xl p-5 h-56 animate-pulse space-y-3">
                <div class="flex justify-between">
                  <div class="h-4 bg-zinc-800 rounded w-1/4" />
                  <div class="h-4 bg-zinc-800 rounded w-1/6" />
                </div>
                <div class="h-6 bg-zinc-800 rounded w-1/2 mt-3" />
                <div class="h-4 bg-zinc-800 rounded w-3/4" />
                <div class="h-4 bg-zinc-800 rounded w-2/3" />
                <div class="h-4 bg-zinc-800 rounded w-1/3 mt-5" />
              </div>
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <div class="glass-panel rounded-xl p-12 text-center border border-zinc-850 flex flex-col items-center justify-center">
            <Calendar class="h-12 w-12 text-zinc-700 mb-3" />
            <p class="text-zinc-300 font-medium">No reservations match the search criteria</p>
            <p class="text-zinc-650 text-xs mt-1">Try selecting a different date range or clearing the active filter.</p>
          </div>
        ) : (
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reservations.map((res) => (
              <ReservationCard
                key={res._id}
                reservation={res}
                onCancel={handleCancelOrDelete}
                onDelete={handleCancelOrDelete}
                isAdmin={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
