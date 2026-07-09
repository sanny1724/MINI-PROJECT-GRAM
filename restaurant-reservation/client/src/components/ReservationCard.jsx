import React, { useState } from 'react';
import { Calendar, Clock, Users, Coffee, CheckCircle, XCircle, Trash2, User } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../services/api';

const ReservationCard = ({ reservation, onCancel, onDelete, isAdmin }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { _id, reservationDate, startTime, endTime, guestCount, status, table, customer } = reservation;

  const handleCancelClick = async () => {
    setLoading(true);
    try {
      const endpoint = `/reservations/${_id}`;
      const response = await API.delete(endpoint);
      if (response.data.success) {
        toast.success('Reservation cancelled successfully');
        setShowConfirm(false);
        if (onCancel) onCancel(_id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel reservation');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async () => {
    setLoading(true);
    try {
      const endpoint = `/admin/reservations/${_id}`;
      const response = await API.delete(endpoint);
      if (response.data.success) {
        toast.success('Reservation deleted successfully');
        setShowConfirm(false);
        if (onDelete) onDelete(_id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete reservation');
    } finally {
      setLoading(false);
    }
  };

  // Helper to format date string to nicer format (e.g. July 10, 2026)
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  const isConfirmed = status === 'confirmed';

  return (
    <div class="glass-panel glass-panel-hover rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
      {/* Glow highlight for active vs cancelled */}
      <div
        class={`absolute top-0 left-0 w-full h-[3px] ${
          isConfirmed ? 'bg-emerald-500' : 'bg-zinc-700'
        }`}
      />

      <div>
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {isConfirmed ? (
              <span class="flex items-center gap-1 text-emerald-400">
                <CheckCircle class="h-3 w-3" />
                Confirmed
              </span>
            ) : (
              <span class="flex items-center gap-1 text-zinc-500">
                <XCircle class="h-3 w-3" />
                Cancelled
              </span>
            )}
          </div>
          {isAdmin && (
            <div class="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
              ID: {_id.substring(_id.length - 6)}
            </div>
          )}
        </div>

        {/* Customer name (for Admins) */}
        {isAdmin && customer && (
          <div class="flex items-center gap-2 mb-3 bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/30">
            <User class="h-4 w-4 text-brand-500" />
            <div class="text-xs leading-none">
              <p class="font-medium text-zinc-200">{customer.name}</p>
              <p class="text-zinc-500 mt-0.5 text-[10px]">{customer.email}</p>
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div class="space-y-2.5 mb-5 text-sm">
          <div class="flex items-center gap-3 text-zinc-300">
            <Calendar class="h-4 w-4 text-brand-500/80 shrink-0" />
            <span>{formatDate(reservationDate)}</span>
          </div>

          <div class="flex items-center gap-3 text-zinc-300">
            <Clock class="h-4 w-4 text-brand-500/80 shrink-0" />
            <span>
              {startTime} - {endTime}
            </span>
          </div>

          <div class="flex items-center gap-3 text-zinc-300">
            <Users class="h-4 w-4 text-brand-500/80 shrink-0" />
            <span>
              {guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}
            </span>
          </div>

          <div class="flex items-center gap-3 text-zinc-300">
            <Coffee class="h-4 w-4 text-brand-500/80 shrink-0" />
            <span>
              {table
                ? `Table ${table.tableNumber} (Seats: ${table.capacity})`
                : 'No Table Assigned'}
            </span>
          </div>
        </div>
      </div>

      {/* Confirmation & Cancel Action Buttons */}
      {isConfirmed && (
        <div class="mt-auto pt-4 border-t border-zinc-800/50">
          {!showConfirm ? (
            <div class="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(true)}
                class="text-xs text-zinc-400 hover:text-red-400 hover:bg-red-950/10 px-3 py-1.5 rounded transition-all border border-transparent hover:border-red-900/30 flex items-center gap-1"
              >
                Cancel Booking
              </button>
              {isAdmin && (
                <button
                  onClick={() => setShowConfirm(true)}
                  class="text-xs text-zinc-400 hover:text-red-400 hover:bg-red-950/10 px-2 py-1.5 rounded transition-all border border-transparent flex items-center"
                  title="Delete reservation completely"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div class="bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-lg">
              <p class="text-[11px] text-zinc-400 text-center mb-2">
                Are you sure you want to cancel this booking?
              </p>
              <div class="flex gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={loading}
                  class="flex-1 text-[11px] text-zinc-300 bg-zinc-800 hover:bg-zinc-700 py-1.5 rounded font-medium transition-all"
                >
                  No, Keep
                </button>
                <button
                  onClick={isAdmin ? handleDeleteClick : handleCancelClick}
                  disabled={loading}
                  class="flex-1 text-[11px] text-white bg-red-650 hover:bg-red-650/80 bg-red-700 py-1.5 rounded font-medium transition-all"
                >
                  {loading ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReservationCard;
