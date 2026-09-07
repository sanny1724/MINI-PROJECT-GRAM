// src/components/GovernancePipeline3D.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, Database, Cpu, ShieldCheck, Zap, Award, 
  ArrowRight, CheckCircle2, Sparkles, Activity
} from 'lucide-react';

const STAGES = [
  {
    id: "01",
    name: "Citizen",
    phase: "Intake & Voice",
    desc: "Villagers file grievances, inspect scheme benefits, and monitor development works in real-time.",
    accent: "#B87932",
    glow: "rgba(184, 121, 50, 0.35)",
    icon: Users,
    detail: "Direct citizen submissions via voice recordings, WhatsApp alerts, and verified public portal."
  },
  {
    id: "02",
    name: "Village Data",
    phase: "LGD Aggregation",
    desc: "Local directory, schemes, budgets, LGD variables, and water/education assets are integrated.",
    accent: "#2A7B72",
    glow: "rgba(42, 123, 114, 0.35)",
    icon: Database,
    detail: "570+ village parameters synced across Mission Bhagiratha, cadastral GIS, and treasury budgets."
  },
  {
    id: "03",
    name: "AI Risk Analysis",
    phase: "Neural Scoring",
    desc: "GRAM algorithms process metrics to detect delays, identify financial anomalies, and compute risk levels.",
    accent: "#5652BA",
    glow: "rgba(86, 82, 186, 0.35)",
    icon: Cpu,
    detail: "Automated machine learning identifies infrastructure bottlenecks and budget leaks before escalation."
  },
  {
    id: "04",
    name: "Collector",
    phase: "Executive Radar",
    desc: "District administration receives visual analytics, highlighting high-risk and delayed projects immediately.",
    accent: "#C27803",
    glow: "rgba(194, 120, 3, 0.35)",
    icon: ShieldCheck,
    detail: "Collector-level heatmaps isolate critical panchayats and bypass bureaucratic red tape in real-time."
  },
  {
    id: "05",
    name: "Govt Action",
    phase: "Rapid Dispatch",
    desc: "Authorities review AI warnings, mobilize resources, resolve grievances, and enforce administrative accountability.",
    accent: "#C84B31",
    glow: "rgba(200, 75, 49, 0.35)",
    icon: Zap,
    detail: "Field engineers, Mandal officers, and Panchayat Secretaries deploy targeted corrective interventions."
  },
  {
    id: "06",
    name: "Development",
    phase: "Measured Impact",
    desc: "Risk scores plummet, public resources are fully optimized, and transparent governance becomes standard.",
    accent: "#2D6A4F",
    glow: "rgba(45, 106, 79, 0.35)",
    icon: Award,
    detail: "Public score transparency, 100% grievance audit trail, and verifiable village upliftment."
  }
];

export default function GovernancePipeline3D() {
  const [activeStage, setActiveStage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Smooth automatic progression across pipeline stages
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % STAGES.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [isHovered]);

  const current = STAGES[activeStage];

  return (
    <div 
      className="w-full flex flex-col gap-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Visual Pipeline Flow Container */}
      <div className="relative py-4">
        
        {/* Animated 3D Light Conduit (Connecting Line with Pulsing Particle) */}
        <div className="hidden lg:block absolute top-[68px] left-[5%] right-[5%] h-[3px] bg-[#17352A]/10 rounded-full z-0 pointer-events-none overflow-hidden">
          {/* Animated flowing gradient beam */}
          <div 
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${((activeStage + 1) / STAGES.length) * 100}%`,
              background: 'linear-gradient(90deg, #B87932, #2A7B72, #5652BA, #C27803, #C84B31, #2D6A4F)'
            }}
          />
          {/* Traveling energy photon */}
          <div 
            className="absolute top-0 bottom-0 w-24 bg-white/90 blur-[2px] transition-all duration-700"
            style={{
              left: `${(activeStage / (STAGES.length - 1)) * 85}%`
            }}
          />
        </div>

        {/* 6 High-End 3D Perspective Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 relative z-10">
          {STAGES.map((stage, idx) => {
            const isActive = activeStage === idx;
            const Icon = stage.icon;

            return (
              <div
                key={stage.id}
                onClick={() => setActiveStage(idx)}
                className="group relative cursor-pointer"
                style={{ perspective: '1000px' }}
              >
                {/* 3D Card Body with Layered Depth */}
                <div
                  className={`w-full h-[370px] rounded-3xl p-5 flex flex-col justify-between transition-all duration-500 relative border ${
                    isActive
                      ? 'bg-white border-transparent -translate-y-3 scale-[1.03] shadow-2xl z-20'
                      : 'bg-white/90 hover:bg-white border-[#17352A]/10 hover:border-[#17352A]/25 hover:-translate-y-1.5 shadow-sm hover:shadow-lg z-10'
                  }`}
                  style={{
                    boxShadow: isActive
                      ? `0 24px 48px -12px ${stage.glow}, 0 4px 16px -2px rgba(23, 53, 42, 0.06), inset 0 1px 1px 0 rgba(255, 255, 255, 1)`
                      : '0 4px 20px -4px rgba(23, 53, 42, 0.05), inset 0 1px 1px 0 rgba(255, 255, 255, 0.8)',
                    borderColor: isActive ? stage.accent : undefined
                  }}
                >
                  {/* Top Glowing Color Accent Bar */}
                  <div
                    className="absolute top-0 left-6 right-6 h-[3px] rounded-b-full transition-all duration-500"
                    style={{
                      backgroundColor: stage.accent,
                      boxShadow: isActive ? `0 2px 12px ${stage.accent}` : 'none'
                    }}
                  />

                  {/* Header: 3D Embossed Number Badge & Stage Icon */}
                  <div className="flex items-center justify-between pt-2">
                    {/* Isometric Number Squircle */}
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center font-mono text-sm font-bold transition-all duration-500 relative"
                      style={{
                        backgroundColor: isActive ? stage.accent : `${stage.accent}14`,
                        color: isActive ? '#FFFFFF' : stage.accent,
                        boxShadow: isActive ? `0 8px 16px -4px ${stage.glow}` : 'none',
                        border: `1px solid ${isActive ? stage.accent : `${stage.accent}30`}`
                      }}
                    >
                      {stage.id}
                      {isActive && (
                        <span 
                          className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white border-2"
                          style={{ borderColor: stage.accent }}
                        />
                      )}
                    </div>

                    {/* Floating 3D Frosted Icon Orb */}
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500"
                      style={{
                        backgroundColor: isActive ? `${stage.accent}18` : '#F5F1E7',
                        color: stage.accent,
                        boxShadow: isActive ? `0 4px 12px ${stage.glow}` : 'none',
                        transform: isActive ? 'scale(1.1) rotate(6deg)' : 'scale(1)'
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-col gap-2 my-auto">
                    <span 
                      className="text-[10px] font-mono font-bold uppercase tracking-wider transition-colors duration-300"
                      style={{ color: stage.accent }}
                    >
                      {stage.phase}
                    </span>

                    <h3 className="font-heading font-bold text-lg text-[#17352A] tracking-tight leading-snug">
                      {stage.name}
                    </h3>

                    <p className="text-xs text-[#5F7668] leading-relaxed font-normal">
                      {stage.desc}
                    </p>
                  </div>

                  {/* Card Footer: Status Dot & Flow Indicator */}
                  <div className="pt-3 border-t border-[#17352A]/8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span 
                        className={`w-2 h-2 rounded-full transition-all duration-500 ${
                          isActive ? 'animate-pulse' : 'opacity-40'
                        }`}
                        style={{ backgroundColor: stage.accent }}
                      />
                      <span className="text-[10px] font-mono font-semibold text-[#5F7668]">
                        {isActive ? 'Live Stage' : `Step ${stage.id}`}
                      </span>
                    </div>

                    <ArrowRight 
                      className={`w-3.5 h-3.5 transition-all duration-300 ${
                        isActive ? 'translate-x-1 opacity-100' : 'opacity-20'
                      }`}
                      style={{ color: stage.accent }}
                    />
                  </div>

                </div>

                {/* Subtle Floating 3D Reflection Shadow under active card */}
                {isActive && (
                  <div 
                    className="absolute -bottom-2 left-4 right-4 h-4 rounded-full blur-md opacity-40 pointer-events-none transition-all duration-500"
                    style={{ backgroundColor: stage.accent }}
                  />
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Deep-Dive Active Stage Telemetry Dock */}
      <div 
        className="bg-white rounded-3xl p-6 border transition-all duration-500 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
        style={{
          borderColor: `${current.accent}30`,
          boxShadow: `0 20px 40px -15px ${current.glow}`
        }}
      >
        {/* Soft atmospheric ambient glow behind the dock */}
        <div 
          className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full blur-3xl opacity-15 pointer-events-none transition-all duration-700"
          style={{ backgroundColor: current.accent }}
        />

        <div className="flex items-center gap-4 z-10">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md transition-all duration-500"
            style={{
              backgroundColor: current.accent,
              boxShadow: `0 8px 20px -4px ${current.glow}`
            }}
          >
            {React.createElement(current.icon, { className: "w-6 h-6" })}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span 
                className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full text-white"
                style={{ backgroundColor: current.accent }}
              >
                STAGE {current.id}
              </span>
              <span className="text-xs font-mono font-bold text-[#17352A]">
                {current.name} • {current.phase}
              </span>
            </div>
            <p className="text-xs md:text-sm text-[#5F7668] mt-1 font-medium leading-relaxed max-w-2xl">
              {current.detail}
            </p>
          </div>
        </div>

        {/* Clean, Tactile Stage Selector Pills */}
        <div className="flex items-center gap-1.5 z-10 self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 border-[#17352A]/10 pt-3 md:pt-0">
          {STAGES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setActiveStage(idx)}
              className={`w-9 h-9 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                activeStage === idx
                  ? 'text-white shadow-md scale-105'
                  : 'bg-[#F5F1E7] text-[#5F7668] hover:bg-white hover:text-[#17352A]'
              }`}
              style={{
                backgroundColor: activeStage === idx ? s.accent : undefined
              }}
              title={`Switch to ${s.name}`}
            >
              {s.id}
            </button>
          ))}
        </div>

      </div>

    </div>
  );
}
