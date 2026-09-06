// src/components/AIPredictiveSimulator.jsx
import React, { useState } from 'react';
import { Sparkles, TrendingUp, Sliders, Droplet, GraduationCap, Activity, ShieldAlert, CheckCircle } from 'lucide-react';

export default function AIPredictiveSimulator({ baselineScore = 23, t, lang }) {
  const [waterGrant, setWaterGrant] = useState(2.5);
  const [schoolGrant, setSchoolGrant] = useState(1.5);
  const [healthGrant, setHealthGrant] = useState(1.0);

  // Dynamic formula: each Lakh invested yields calculated point boost
  const waterBoost = Math.round(waterGrant * 8.5);
  const schoolBoost = Math.round(schoolGrant * 6.2);
  const healthBoost = Math.round(healthGrant * 5.4);

  const rawProjected = baselineScore + waterBoost + schoolBoost + healthBoost;
  const projectedScore = Math.min(96, Math.max(baselineScore, rawProjected));
  const scoreDelta = projectedScore - baselineScore;

  const projectedRisk = projectedScore >= 75 ? 'LOW' : projectedScore >= 45 ? 'MEDIUM' : 'HIGH';

  return (
    <div className="bg-white border border-[#17352A]/10 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#17352A]/10 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-[#B87932] uppercase tracking-wider">
            {t.simulatorSubtitle}
          </span>
          <h3 className="font-heading font-bold text-xl text-[#17352A] mt-0.5 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#B87932]" />
            {t.simulatorTitle}
          </h3>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold bg-amber-500/10 text-[#B87932] border border-[#B87932]/25">
          <Sliders className="w-3.5 h-3.5" /> Live What-If Model
        </span>
      </div>

      {/* Simulator Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left 7 cols: Sliders */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          
          {/* Slider 1: Water Grant */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-bold text-[#17352A] flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-blue-600" />
                {t.simWaterGrant}
              </span>
              <span className="font-bold text-[#B87932]">₹{waterGrant.toFixed(1)} Lakhs (+{waterBoost} pts)</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={waterGrant}
              onChange={(e) => setWaterGrant(parseFloat(e.target.value))}
              className="w-full accent-[#B87932] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#5F7668] font-mono">
              <span>₹0 L</span>
              <span>₹2.5 L</span>
              <span>₹5.0 L</span>
            </div>
          </div>

          {/* Slider 2: School Grant */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-bold text-[#17352A] flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                {t.simSchoolGrant}
              </span>
              <span className="font-bold text-[#B87932]">₹{schoolGrant.toFixed(1)} Lakhs (+{schoolBoost} pts)</span>
            </div>
            <input
              type="range"
              min="0"
              max="4"
              step="0.5"
              value={schoolGrant}
              onChange={(e) => setSchoolGrant(parseFloat(e.target.value))}
              className="w-full accent-[#B87932] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#5F7668] font-mono">
              <span>₹0 L</span>
              <span>₹2.0 L</span>
              <span>₹4.0 L</span>
            </div>
          </div>

          {/* Slider 3: Health Grant */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-bold text-[#17352A] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-rose-600" />
                {t.simHealthGrant}
              </span>
              <span className="font-bold text-[#B87932]">₹{healthGrant.toFixed(1)} Lakhs (+{healthBoost} pts)</span>
            </div>
            <input
              type="range"
              min="0"
              max="3"
              step="0.5"
              value={healthGrant}
              onChange={(e) => setHealthGrant(parseFloat(e.target.value))}
              className="w-full accent-[#B87932] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#5F7668] font-mono">
              <span>₹0 L</span>
              <span>₹1.5 L</span>
              <span>₹3.0 L</span>
            </div>
          </div>

        </div>

        {/* Right 5 cols: Projected Score Output Display */}
        <div className="lg:col-span-5 bg-[#F5F1E7] border border-[#17352A]/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs">
          <span className="text-[10px] font-mono uppercase text-[#5F7668] font-bold">
            {t.projectedScore}
          </span>
          
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-5xl font-heading font-black text-[#17352A] font-mono-num">
              {projectedScore}
            </span>
            <span className="text-sm font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">
              +{scoreDelta} pts
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono mt-3">
            <span className="text-[#5F7668]">{t.baselineScore}: <strong>{baselineScore}</strong></span>
            <span>•</span>
            <span className={`font-bold px-2 py-0.5 rounded-md ${
              projectedRisk === 'LOW' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {t.projectedRisk}: {projectedRisk}
            </span>
          </div>

          <p className="text-[11px] text-[#5F7668] leading-snug mt-3">
            {t.simImpactNote}
          </p>
        </div>

      </div>

    </div>
  );
}
