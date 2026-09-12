// src/components/GovtHeaderRibbon.jsx
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Globe, Volume2, Sparkles } from 'lucide-react';

const STATEWIDE_UPDATES = [
  { loc: "Medak", text: "4 Mission Bhagiratha pipeline valves restored in Ramayampet Mandal", time: "12m ago", icon: "💧" },
  { loc: "Siddipet", text: "Solar micro-grid village audit completed — 100% compliance", time: "24m ago", icon: "⚡" },
  { loc: "Statewide", text: "1,248 public grievances resolved across 33 districts this week", time: "35m ago", icon: "🏛️" },
  { loc: "Jangaon", text: "Groundwater recharge telemetry updated: Water level +1.4m", time: "45m ago", icon: "🌱" },
  { loc: "Nalgonda", text: "Gram Sabha digital budget poll finalized for 42 Panchayats", time: "50m ago", icon: "🗳️" }
];

export default function GovtHeaderRibbon({ lang = 'en', onToggleLang }) {
  const [tickerIndex, setTickerIndex] = useState(0);
  const [fontSizeLevel, setFontSizeLevel] = useState(1); // 0 = sm, 1 = normal, 2 = lg
  const [isHighContrast, setIsHighContrast] = useState(false);

  // Rotate ticker every 4.2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % STATEWIDE_UPDATES.length);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  // Handle font size change
  const handleFontSize = (level) => {
    setFontSizeLevel(level);
    const root = document.documentElement;
    if (level === 0) root.style.fontSize = '90%';
    else if (level === 1) root.style.fontSize = '100%';
    else if (level === 2) root.style.fontSize = '110%';
  };

  const handleContrastToggle = () => {
    setIsHighContrast(!isHighContrast);
    document.body.classList.toggle('high-contrast');
  };

  const currentUpdate = STATEWIDE_UPDATES[tickerIndex];

  return (
    <div className="w-full bg-[#12251D] text-[#E8EEE6] border-b border-[#B87932]/25 text-[11px] font-sans relative z-[60] shadow-xs select-none">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-y-1 gap-x-4">
        
        {/* LEFT: Official State & Department Affiliation */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-3 rounded-xs overflow-hidden border border-white/20 shadow-xs relative shrink-0">
              <span className="block h-1 bg-[#FF9933]"></span>
              <span className="block h-1 bg-white relative flex items-center justify-center">
                <span className="w-0.5 h-0.5 rounded-full bg-[#000080]"></span>
              </span>
              <span className="block h-1 bg-[#128807]"></span>
            </span>
            <img 
              src="/telangana-seal.png" 
              alt="Telangana Seal" 
              className="w-4 h-4 object-contain rounded-full bg-white/90 p-0.2 shrink-0" 
            />
          </div>
          <div className="flex items-center gap-1.5 font-medium tracking-tight">
            <span className="font-semibold text-white">Government of Telangana</span>
            <span className="text-[#B87932]">•</span>
            <span className="text-white/80 hidden sm:inline">తెలంగాణ ప్రభుత్వం</span>
            <span className="text-white/30 hidden md:inline">|</span>
            <span className="text-[#B87932] text-[10px] font-mono uppercase tracking-wider hidden lg:inline font-bold">
              Panchayat Raj & Rural Development
            </span>
          </div>
        </div>

        {/* CENTER: Live Statewide Governance Ticker */}
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-lg mx-auto overflow-hidden">
          <div className="flex items-center gap-1.5 bg-[#17352A] border border-[#B87932]/30 px-2 py-0.5 rounded-full shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[9px] font-mono font-bold text-[#B87932] tracking-wider uppercase">
              Live Stream
            </span>
          </div>
          <div className="truncate flex items-center gap-1.5 text-[10px] text-white/90 transition-opacity duration-500">
            <span className="shrink-0">{currentUpdate.icon}</span>
            <strong className="text-white font-semibold shrink-0">[{currentUpdate.loc}]:</strong>
            <span className="truncate font-light">{currentUpdate.text}</span>
            <span className="text-white/40 text-[9px] font-mono shrink-0 font-medium">({currentUpdate.time})</span>
          </div>
        </div>

        {/* RIGHT: Official Trust, Security & Accessibility Suite */}
        <div className="flex items-center gap-3 shrink-0 ml-auto md:ml-0">
          
          {/* Security & Verification Pill */}
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-emerald-300/90 bg-[#17352A]/80 border border-emerald-500/25 px-2 py-0.5 rounded-md">
            <Lock className="w-2.5 h-2.5 text-emerald-400" />
            <span className="font-bold">LGD &amp; NIC Verified</span>
          </div>

          {/* Font Resizer A- / A / A+ */}
          <div className="flex items-center bg-[#17352A] border border-white/10 rounded-md overflow-hidden text-[10px] font-mono">
            <button 
              onClick={() => handleFontSize(0)} 
              className={`px-1.5 py-0.5 hover:bg-[#B87932]/30 transition-colors ${fontSizeLevel === 0 ? 'text-[#B87932] font-bold' : 'text-white/70'}`}
              title="Small Text (A-)"
            >
              A-
            </button>
            <span className="text-white/20">|</span>
            <button 
              onClick={() => handleFontSize(1)} 
              className={`px-1.5 py-0.5 hover:bg-[#B87932]/30 transition-colors ${fontSizeLevel === 1 ? 'text-[#B87932] font-bold' : 'text-white/70'}`}
              title="Standard Text (A)"
            >
              A
            </button>
            <span className="text-white/20">|</span>
            <button 
              onClick={() => handleFontSize(2)} 
              className={`px-1.5 py-0.5 hover:bg-[#B87932]/30 transition-colors ${fontSizeLevel === 2 ? 'text-[#B87932] font-bold' : 'text-white/70'}`}
              title="Large Text (A+)"
            >
              A+
            </button>
          </div>

          {/* High Contrast / Sunlight reader toggle */}
          <button
            onClick={handleContrastToggle}
            className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-all border ${
              isHighContrast 
                ? 'bg-amber-400 text-black border-amber-300 font-bold' 
                : 'bg-[#17352A] border-white/10 text-white/80 hover:text-white'
            }`}
            title="Toggle High Contrast / Sunlight Mode"
          >
            {isHighContrast ? 'Contrast ON' : 'High Contrast'}
          </button>

          {/* Quick Language Toggle if handler provided */}
          {onToggleLang && (
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1 text-[10px] font-mono font-bold bg-[#B87932]/20 hover:bg-[#B87932]/40 text-amber-200 border border-[#B87932]/40 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
              title="Switch Language"
            >
              <Globe className="w-2.5 h-2.5" />
              <span>{lang === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>
          )}

        </div>

      </div>
    </div>
  );
}
