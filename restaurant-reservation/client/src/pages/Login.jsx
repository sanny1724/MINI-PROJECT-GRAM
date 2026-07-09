import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, Utensils } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Where to redirect after login (default is /dashboard)
  const from = location.state?.from?.pathname || '/dashboard';

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      toast.success('Logged in successfully!');
      navigate(from, { replace: true });
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-[#0b0c10]">
      <div class="w-full max-w-md p-8 glass-panel rounded-2xl border border-zinc-800/80 shadow-2xl relative overflow-hidden">
        {/* Decorative corner glows */}
        <div class="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse-slow" />
        <div class="absolute bottom-0 left-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl -ml-16 -mb-16 animate-pulse-slow" />

        <div class="flex flex-col items-center mb-8 relative">
          <div class="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/30 mb-3">
            <Utensils class="h-8 w-8 text-brand-500" />
          </div>
          <h2 class="text-2xl font-bold text-zinc-100 tracking-tight">Welcome Back</h2>
          <p class="text-zinc-500 text-sm mt-1">Sign in to manage your dining reservations</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} class="space-y-5 relative">
          {/* Email */}
          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <Mail class="h-4.5 w-4.5 text-zinc-600" />
              </span>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                class="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && (
              <p class="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <Lock class="h-4.5 w-4.5 text-zinc-600" />
              </span>
              <input
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                class="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p class="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            class="w-full btn-primary py-3 flex items-center justify-center font-semibold tracking-wide"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Register Redirect */}
        <div class="mt-6 text-center text-xs text-zinc-500 relative">
          <span>Don't have an account? </span>
          <Link to="/register" class="text-brand-400 hover:text-brand-300 font-medium transition-all">
            Sign up now
          </Link>
        </div>

        {/* Demo Credentials Alert */}
        <div class="mt-6 p-3 rounded-lg bg-brand-950/20 border border-brand-900/30 text-center">
          <p class="text-[11px] text-brand-400 font-semibold uppercase tracking-wider">
            Demo Credentials
          </p>
          <div class="grid grid-cols-2 gap-2 mt-1.5 text-[10px] text-zinc-400 text-left px-2">
            <div>
              <span class="font-medium text-zinc-300">Admin:</span> admin@gmail.com
            </div>
            <div>
              <span class="font-medium text-zinc-300">Pass:</span> Admin@123
            </div>
            <div>
              <span class="font-medium text-zinc-300">Customer:</span> customer@gmail.com
            </div>
            <div>
              <span class="font-medium text-zinc-300">Pass:</span> Customer@123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
