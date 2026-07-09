import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Calendar, ShieldCheck, Zap, ArrowRight, Table } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Landing = () => {
  const { user } = useAuth();

  return (
    <div class="min-h-[calc(100vh-4rem)] bg-[#0b0c10] relative flex flex-col justify-center overflow-hidden">
      {/* Dynamic Background Glows */}
      <div class="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-650/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse-slow" />
      <div class="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-650/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse-slow" />

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Copy */}
          <div class="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-950/40 border border-brand-900/30 text-xs font-semibold text-brand-400">
              <Zap class="h-3.5 w-3.5" />
              Intelligent Table Seating System
            </div>

            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-100 leading-tight font-sans tracking-tight">
              Exquisite Dining, <br class="hidden sm:inline" />
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-brand-500 to-amber-500">
                Seamless Seating
              </span>
            </h1>

            <p class="text-zinc-400 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              GourmetTable handles restaurant seating with precision. Submit your date, slot times, and guests count—our real-time capacity engine maps your slot instantly without collisions.
            </p>

            <div class="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              {user ? (
                <Link to="/dashboard" class="btn-primary flex items-center gap-2">
                  <span>Go to Dashboard</span>
                  <ArrowRight class="h-4.5 w-4.5" />
                </Link>
              ) : (
                <>
                  <Link to="/register" class="btn-primary flex items-center gap-2">
                    <span>Reserve a Table</span>
                    <ArrowRight class="h-4.5 w-4.5" />
                  </Link>
                  <Link
                    to="/login"
                    class="btn-secondary flex items-center gap-1.5"
                  >
                    <span>Admin Panel</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Visual Feature Grid */}
          <div class="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1 */}
            <div class="glass-panel p-5 rounded-xl border border-zinc-850 hover:border-brand-500/25 transition-all">
              <div class="p-2 rounded-lg bg-brand-500/10 w-fit mb-4">
                <Table class="h-5 w-5 text-brand-500" />
              </div>
              <h3 class="text-sm font-bold text-zinc-200">Instant Allocation</h3>
              <p class="text-zinc-500 text-xs mt-2 leading-relaxed">
                Capacity-aware engine automatically selects the smallest suitable table to maximize dining floor layout.
              </p>
            </div>

            {/* Card 2 */}
            <div class="glass-panel p-5 rounded-xl border border-zinc-850 hover:border-brand-500/25 transition-all">
              <div class="p-2 rounded-lg bg-emerald-500/10 w-fit mb-4">
                <ShieldCheck class="h-5 w-5 text-emerald-500" />
              </div>
              <h3 class="text-sm font-bold text-zinc-200">Zero Overlaps</h3>
              <p class="text-zinc-500 text-xs mt-2 leading-relaxed">
                Protects tables from double bookings. Evaluates conflict minutes to guarantee slots are strictly isolated.
              </p>
            </div>

            {/* Card 3 */}
            <div class="glass-panel p-5 rounded-xl border border-zinc-850 hover:border-brand-500/25 transition-all">
              <div class="p-2 rounded-lg bg-cyan-500/10 w-fit mb-4">
                <Calendar class="h-5 w-5 text-cyan-400" />
              </div>
              <h3 class="text-sm font-bold text-zinc-200">Flex Cancellation</h3>
              <p class="text-zinc-500 text-xs mt-2 leading-relaxed">
                Release your table immediately upon cancellation, freeing the seating slot for other diners in real-time.
              </p>
            </div>

            {/* Card 4 */}
            <div class="glass-panel p-5 rounded-xl border border-zinc-850 hover:border-brand-500/25 transition-all">
              <div class="p-2 rounded-lg bg-purple-500/10 w-fit mb-4">
                <Utensils class="h-5 w-5 text-purple-400" />
              </div>
              <h3 class="text-sm font-bold text-zinc-200">Premium Dining</h3>
              <p class="text-zinc-500 text-xs mt-2 leading-relaxed">
                Seating cards reflect table size, location status, and timing details for user ease of access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
