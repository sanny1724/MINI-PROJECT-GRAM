// src/pages/Login.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Compass, Mail, Lock, Shield, ChevronRight, Loader2, User } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api';

export default function Login({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      role: 'Panchayat',
      lgdCode: ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isLogin) {
        // Sign In Flow
        const response = await api.post('/auth/login', {
          email: data.email,
          password: data.password
        });
        
        const { token, user } = response.data;
        localStorage.setItem('stockflow_token', token);
        localStorage.setItem('stockflow_user', JSON.stringify(user));
        
        onLoginSuccess(user, token);
        toast.success(`Welcome back, ${user.email}!`);
        navigate('/dashboard');
      } else {
        // Sign Up Flow
        const response = await api.post('/auth/signup', {
          email: data.email,
          password: data.password,
          role: data.role,
          lgdCode: parseInt(data.lgdCode) || 569005
        });
        
        const { token, user } = response.data;
        localStorage.setItem('stockflow_token', token);
        localStorage.setItem('stockflow_user', JSON.stringify(user));
        
        onLoginSuccess(user, token);
        toast.success(`Officer profile registered successfully!`);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      const errMsg = err.response?.data?.error || 'Authentication failed. Please try again.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    reset();
  };

  return (
    <div className="auth-page bg-[#16241D]">
      <div className="auth-card glass max-w-md w-full mx-4 shadow-2xl relative overflow-hidden border border-[#F2F0E6]/10 p-8 rounded-3xl">
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#C98A2E]/10 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-[#C98A2E]/5 blur-3xl"></div>

        <div className="auth-logo mx-auto bg-[#C98A2E] text-[#16241D] w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">
          <Compass size={24} />
        </div>

        <h2 className="auth-title font-heading text-2xl font-black text-center text-white mt-4 tracking-tight">
          {isLogin ? 'Officer Portal' : 'Register Officer Profile'}
        </h2>
        <p className="auth-subtitle mt-2 text-xs text-[#F2F0E6]/60 text-center leading-relaxed">
          {isLogin 
            ? 'Access the village audit system, manage development indexes, and review citizen grievances.' 
            : 'Register a new administrative officer profile in the Telangana LGD Directory.'}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full text-left mt-6 space-y-4 text-xs">
          
          {/* LGD Code & Role Dropdown (Signup Only) */}
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-bold text-[#F2F0E6]/50 uppercase">
                  Officer Role
                </label>
                <div className="relative flex items-center bg-[#24382C]/50 border border-[#F2F0E6]/10 focus-within:border-[#C98A2E] rounded-xl px-4 py-2.5">
                  <User className="text-[#C98A2E] mr-3" size={16} />
                  <select
                    className="w-full bg-transparent text-xs text-white outline-none font-heading"
                    {...register('role', { required: !isLogin })}
                  >
                    <option value="Panchayat">Panchayat Secretary</option>
                    <option value="Collector">District Collector</option>
                  </select>
                </div>
              </div>

              <div className="form-group flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-bold text-[#F2F0E6]/50 uppercase">
                  Village LGD Code
                </label>
                <div className="relative flex items-center bg-[#24382C]/50 border border-[#F2F0E6]/10 focus-within:border-[#C98A2E] rounded-xl px-4 py-2.5">
                  <Shield className="text-[#C98A2E] mr-3" size={16} />
                  <input
                    type="number"
                    placeholder="e.g. 569005"
                    className="w-full bg-transparent text-xs text-white outline-none font-mono"
                    {...register('lgdCode', { 
                      required: !isLogin ? 'LGD Code is required' : false 
                    })}
                  />
                </div>
                {errors.lgdCode && (
                  <span className="text-[10px] text-red-400 font-medium block mt-1">
                    {errors.lgdCode.message}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="form-group flex flex-col gap-1.5">
            <label className="text-[10px] font-mono font-bold text-[#F2F0E6]/50 uppercase">
              Email Address
            </label>
            <div className="relative flex items-center bg-[#24382C]/50 border border-[#F2F0E6]/10 focus-within:border-[#C98A2E] rounded-xl px-4 py-2.5">
              <Mail className="text-[#C98A2E] mr-3" size={16} />
              <input
                type="email"
                placeholder="officer@telangana.gov.in"
                className="w-full bg-transparent text-xs text-white outline-none font-heading"
                {...register('email', { 
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address format'
                  }
                })}
              />
            </div>
            {errors.email && (
              <span className="text-[10px] text-red-400 font-medium block mt-1">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group flex flex-col gap-1.5">
            <label className="text-[10px] font-mono font-bold text-[#F2F0E6]/50 uppercase">
              Password
            </label>
            <div className="relative flex items-center bg-[#24382C]/50 border border-[#F2F0E6]/10 focus-within:border-[#C98A2E] rounded-xl px-4 py-2.5">
              <Lock className="text-[#C98A2E] mr-3" size={16} />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-transparent text-xs text-white outline-none font-mono"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters long'
                  }
                })}
              />
            </div>
            {errors.password && (
              <span className="text-[10px] text-red-400 font-medium block mt-1">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C98A2E] hover:bg-[#b07824] disabled:opacity-60 text-[#16241D] font-mono font-bold rounded-xl py-3 px-4 text-xs block transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <Loader2 className="animate-spin text-[#16241D]" size={18} />
            ) : (
              <>
                <span>{isLogin ? 'Secure Sign In' : 'Register Officer Profile'}</span>
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode footer */}
        <div className="mt-8 text-center text-xs text-[#F2F0E6]/50">
          <span>{isLogin ? "Need a new officer register? " : 'Already registered? '}</span>
          <button
            onClick={toggleMode}
            className="text-[#C98A2E] hover:underline font-bold cursor-pointer transition-colors"
          >
            {isLogin ? 'Create profile here' : 'Sign in here'}
          </button>
        </div>
      </div>
    </div>
  );
}
