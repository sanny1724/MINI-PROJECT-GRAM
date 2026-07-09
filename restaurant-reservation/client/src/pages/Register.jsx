import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, User, Utensils } from 'lucide-react';

const Register = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordVal = watch('password');

  const onSubmit = async (data) => {
    const result = await signup(data.name, data.email, data.password);
    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/dashboard');
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
          <h2 class="text-2xl font-bold text-zinc-100 tracking-tight">Create Account</h2>
          <p class="text-zinc-500 text-sm mt-1">Join GourmetTable for hassle-free dining reservations</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} class="space-y-4 relative">
          {/* Full Name */}
          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <User class="h-4.5 w-4.5 text-zinc-600" />
              </span>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                class="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-zinc-100 placeholder-zinc-650 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                placeholder="John Doe"
              />
            </div>
            {errors.name && (
              <p class="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
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
                class="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-zinc-100 placeholder-zinc-650 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && (
              <p class="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
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
                class="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-zinc-100 placeholder-zinc-650 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p class="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <Lock class="h-4.5 w-4.5 text-zinc-600" />
              </span>
              <input
                type="password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (val) => val === passwordVal || 'Passwords do not match',
                })}
                class="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-zinc-100 placeholder-zinc-650 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && (
              <p class="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            class="w-full btn-primary py-3 flex items-center justify-center font-semibold tracking-wide mt-2"
          >
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div class="mt-6 text-center text-xs text-zinc-550 text-zinc-500 relative">
          <span>Already have an account? </span>
          <Link to="/login" class="text-brand-400 hover:text-brand-300 font-medium transition-all">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
