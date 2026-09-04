// src/components/EmergencyAlertBanner.jsx
import React, { useState } from 'react';
import { AlertTriangle, PhoneCall, X, ShieldAlert, Zap, Truck, Users } from 'lucide-react';

export default function EmergencyAlertBanner({ t, lang }) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="bg-amber-500/10 border-y border-amber-500/25 px-6 py-3.5 text-[#17352A] transition-all animate-fade-in">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        
        {/* Advisory Header & Message */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 animate-bounce" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase bg-amber-500 text-white px-2 py-0.2 rounded-full">
                ACTIVE ADVISORY
              </span>
              <span className="font-heading font-bold text-xs md:text-sm text-[#17352A]">
                {t.emergencyAlertTitle}
              </span>
            </div>
            <p className="text-[11px] md:text-xs text-[#5F7668] mt-0.5 leading-snug">
              {t.emergencyAlertDesc}
            </p>
          </div>
        </div>

        {/* SOS Fast Dial Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-[10px] font-bold text-[#5F7668] hidden xl:inline">
            {t.sosContacts}
          </span>
          
          <a
            href="tel:108"
            className="bg-white border border-rose-200 hover:border-rose-400 text-rose-700 px-3 py-1 rounded-xl flex items-center gap-1.5 font-bold shadow-2xs hover:scale-105 transition-all"
            title="Call 108 Emergency Ambulance"
          >
            <PhoneCall className="w-3 h-3 text-rose-600" />
            <span>{t.ambulance108}</span>
          </a>

          <a
            href="tel:1912"
            className="bg-white border border-amber-200 hover:border-amber-400 text-amber-800 px-3 py-1 rounded-xl flex items-center gap-1.5 font-bold shadow-2xs hover:scale-105 transition-all"
            title="Call Electricity Lineman (1912)"
          >
            <Zap className="w-3 h-3 text-amber-600" />
            <span>{t.electricitySos}</span>
          </a>

          <a
            href="tel:08452222333"
            className="bg-white border border-[#17352A]/15 hover:border-[#B87932] text-[#17352A] px-3 py-1 rounded-xl flex items-center gap-1.5 font-bold shadow-2xs hover:scale-105 transition-all"
            title="Call MRO Office"
          >
            <Users className="w-3 h-3 text-[#B87932]" />
            <span>{t.mroOffice}</span>
          </a>

          <button
            onClick={() => setIsDismissed(true)}
            className="text-[#5F7668] hover:text-[#17352A] p-1 ml-1 cursor-pointer transition-colors"
            title="Dismiss advisory"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
