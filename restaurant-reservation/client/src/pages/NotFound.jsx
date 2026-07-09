import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div class="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4 bg-[#0b0c10]">
      <div class="p-4 rounded-full bg-brand-500/10 border border-brand-500/30 mb-6">
        <HelpCircle class="h-12 w-12 text-brand-500" />
      </div>
      
      <h1 class="text-4xl font-extrabold text-zinc-100 tracking-tight">404 - Page Not Found</h1>
      <p class="text-zinc-500 text-sm mt-3 max-w-sm">
        The page you are looking for does not exist or has been relocated to another route.
      </p>

      <Link
        to="/dashboard"
        class="btn-primary mt-8 flex items-center gap-2 text-sm"
      >
        <ArrowLeft class="h-4 w-4" />
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
