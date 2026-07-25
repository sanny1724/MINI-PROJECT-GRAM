// src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Settings as SettingsIcon, Building, Shield, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api';

export default function Settings({ onUserUpdate }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      defaultThreshold: 569005 // LGD code
    }
  });

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setValue('name', response.data.name);
      setValue('defaultThreshold', response.data.defaultThreshold);
    } catch (err) {
      console.error('Failed to load settings:', err);
      toast.error('Failed to load office settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const response = await api.put('/settings', {
        name: data.name,
        defaultThreshold: data.defaultThreshold
      });
      
      // Update local storage and global state to reflect the new office name
      const storedUser = JSON.parse(localStorage.getItem('stockflow_user') || '{}');
      const updatedUser = {
        ...storedUser,
        organizationName: response.data.name,
        lgdCode: response.data.defaultThreshold
      };
      localStorage.setItem('stockflow_user', JSON.stringify(updatedUser));
      onUserUpdate(updatedUser);

      toast.success(response.data.message || 'Office settings updated successfully!');
    } catch (err) {
      console.error('Failed to save settings:', err);
      toast.error('Failed to update office settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#16241D]">
        <Loader2 className="animate-spin text-[#C98A2E]" size={36} />
      </div>
    );
  }

  return (
    <div className="p-6 overflow-y-auto h-full w-full max-w-2xl mx-auto space-y-6 custom-scroll">
      <div className="rounded-2xl glass border border-[#F2F0E6]/10 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-[#C98A2E]/5 blur-3xl"></div>
        
        <div className="flex items-center gap-3 pb-4 border-b border-[#F2F0E6]/10">
          <div className="p-2 bg-[#C98A2E]/10 rounded-xl text-[#C98A2E]">
            <SettingsIcon size={20} />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-xl text-white tracking-tight">LGD Office Profile</h2>
            <p className="text-[#F2F0E6]/60 text-xs mt-0.5">Manage office designation and assigned code settings.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 text-xs">
          {/* Office Designation */}
          <div className="form-group flex flex-col gap-1.5 mb-4">
            <label className="text-[10px] font-mono font-bold text-[#F2F0E6]/50 uppercase">
              Office Designation
            </label>
            <div className="relative flex items-center bg-[#24382C]/50 border border-[#F2F0E6]/10 focus-within:border-[#C98A2E] rounded-xl px-4 py-2.5">
              <Building className="text-[#C98A2E] mr-3" size={16} />
              <input
                type="text"
                placeholder="e.g. Ghatkesar Panchayat Office"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#F2F0E6]/40 font-heading"
                {...register('name', { required: 'Office designation is required' })}
              />
            </div>
            {errors.name && (
              <span className="text-[11px] text-red-400 font-medium block mt-1">
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Assigned LGD Code */}
          <div className="form-group flex flex-col gap-1.5 mb-6">
            <label className="text-[10px] font-mono font-bold text-[#F2F0E6]/50 uppercase">
              Assigned LGD Code register
            </label>
            <div className="relative flex items-center bg-[#24382C]/50 border border-[#F2F0E6]/10 focus-within:border-[#C98A2E] rounded-xl px-4 py-2.5">
              <Shield className="text-[#C98A2E] mr-3" size={16} />
              <input
                type="number"
                placeholder="582490"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#F2F0E6]/40 font-mono"
                {...register('defaultThreshold', {
                  required: 'LGD Code is required',
                  min: { value: 1, message: 'LGD Code must be a positive integer' }
                })}
              />
            </div>
            <p className="text-[11px] text-[#F2F0E6]/40 mt-1 leading-relaxed">
              This LGD code binds your user profile to a specific Panchayat Village (or District) index in the Telangana Local Government Directory schema.
            </p>
            {errors.defaultThreshold && (
              <span className="text-[11px] text-red-400 font-medium block mt-1">
                {errors.defaultThreshold.message}
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#C98A2E] hover:bg-[#b07824] disabled:opacity-60 text-[#16241D] font-mono font-bold rounded-xl py-3 px-4 text-xs block transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 className="animate-spin text-[#16241D]" size={16} />
            ) : (
              <>
                <Save size={16} />
                <span>Save Office Settings</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="p-4 rounded-xl bg-[#24382C]/20 border border-[#F2F0E6]/10 text-xs text-[#F2F0E6]/50 font-medium leading-relaxed">
        <h4 className="text-[#C98A2E] font-semibold mb-1">Administrative Scope:</h4>
        All data mutations are strictly validated via your authenticated token context. Cross-referencing other LGD parameters is disabled for local Panchayat profiles.
      </div>
    </div>
  );
}
