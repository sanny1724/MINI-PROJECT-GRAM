// src/components/TelanganaAppLoader.jsx
import React from 'react';

export default function TelanganaAppLoader({ message = "Connecting Statewide Governance Network..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-[#F5F1E7] text-[#17352A] p-6 relative overflow-hidden select-none">
      <div className="absolute w-96 h-96 rounded-full bg-[#B87932]/10 blur-3xl pointer-events-none" />
      <div className="absolute w-80 h-80 rounded-full bg-[#2A7B72]/10 blur-3xl pointer-events-none -translate-y-20" />
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute inset-0 -m-3.5 rounded-full border-2 border-dashed border-[#B87932]/40 animate-[spin_16s_linear_infinite]" />
          <div className="absolute inset-0 -m-1.5 rounded-full border border-[#17352A]/15" />
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white shadow-2xl p-2 border-2 border-[#17352A]/10 flex items-center justify-center overflow-hidden">
            <img 
              src="/telangana-seal.png" 
              alt="Government of Telangana Seal" 
              className="w-full h-full object-contain animate-[pulse_3s_ease-in-out_infinite]"
            />
          </div>
        </div>

        <span className="text-[11px] font-mono font-bold tracking-widest text-[#B87932] uppercase mb-1">
          Government of Telangana • తెలంగాణ ప్రభుత్వం
        </span>
        
        <h1 className="font-heading font-black text-2xl md:text-3xl text-[#17352A] tracking-tight mb-1">
          GRAM Platform
        </h1>
        
        <p className="text-xs text-[#5F7668] max-w-xs leading-relaxed mb-6 font-medium">
          Governance, Risk &amp; Accountability Monitor
        </p>

        <div className="w-52 h-1.5 bg-[#17352A]/10 rounded-full overflow-hidden mb-3.5 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-[#B87932] via-[#2A7B72] to-[#B87932] rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" 
            style={{ width: '100%' }} 
          />
        </div>

        <div className="inline-flex items-center gap-2 bg-white/80 border border-[#17352A]/10 px-3.5 py-1.5 rounded-full shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping shrink-0" />
          <span className="text-[10px] font-mono font-semibold text-[#17352A] tracking-tight">
            {message}
          </span>
        </div>
      </div>
    </div>
  );
}
