import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div class="max-w-xl mx-auto px-4 py-12">
      {/* Back button */}
      <Link
        to="/dashboard"
        class="inline-flex items-center gap-1 text-zinc-550 text-zinc-500 hover:text-zinc-350 text-xs font-semibold uppercase tracking-wider mb-6 transition-all"
      >
        <ArrowLeft class="h-3.5 w-3.5" />
        Back to Dashboard
      </Link>

      <div class="glass-panel rounded-2xl p-8 border border-zinc-800/80 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div class="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

        <div class="flex flex-col items-center mb-8 pb-6 border-b border-zinc-800/60 relative">
          <div class="p-4 rounded-full bg-brand-600/10 border border-brand-500/30 mb-4">
            <User class="h-12 w-12 text-brand-500" />
          </div>
          <h2 class="text-2xl font-bold text-zinc-100">{user?.name}</h2>
          <span class="text-xs font-semibold uppercase tracking-widest text-brand-400 mt-1 bg-brand-950/40 border border-brand-900/30 px-3 py-1 rounded-full">
            {user?.role} Account
          </span>
        </div>

        <div class="space-y-5 relative text-sm">
          {/* Email */}
          <div class="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-850">
            <div class="flex items-center gap-3">
              <Mail class="h-4.5 w-4.5 text-zinc-550 text-zinc-500" />
              <span class="text-zinc-400">Email Address</span>
            </div>
            <span class="font-medium text-zinc-250 text-zinc-200">{user?.email}</span>
          </div>

          {/* Role */}
          <div class="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-850">
            <div class="flex items-center gap-3">
              <Shield class="h-4.5 w-4.5 text-zinc-550 text-zinc-500" />
              <span class="text-zinc-400">Role Privilege</span>
            </div>
            <span class="font-semibold text-zinc-200 capitalize">{user?.role}</span>
          </div>

          {/* Dummy instructions */}
          <div class="p-4 rounded-xl bg-zinc-900/20 border border-zinc-850/60 text-center mt-6">
            <p class="text-xs text-zinc-550 text-zinc-500 leading-relaxed">
              To update your email or change your password, please contact the restaurant administration team. Security profile adjustments require authentication verification steps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
