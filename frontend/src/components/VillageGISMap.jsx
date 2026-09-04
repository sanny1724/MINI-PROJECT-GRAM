// src/components/VillageGISMap.jsx
import React, { useState } from 'react';
import { 
  MapPin, Droplet, GraduationCap, Activity, Building, 
  AlertCircle, CheckCircle, Info, Layers, Eye, Navigation
} from 'lucide-react';

export default function VillageGISMap({ villageInfo, grievances = [], lang = 'en', t }) {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [filterType, setFilterType] = useState('ALL');

  // Realistic mock geo-referenced assets for the village
  const defaultAssets = [
    {
      id: 'ast-1',
      name: 'Mission Bhagiratha Overhead Tank & Sump',
      category: 'Water',
      status: 'Functional',
      coords: { x: 38, y: 28 },
      metrics: 'Capacity: 1.2 Lakh Liters • 98% Potable Purity',
      lastInspected: '2 days ago by Assistant Executive Engineer',
      icon: Droplet,
      color: 'bg-blue-600',
      textColor: 'text-blue-700',
      badgeBg: 'bg-blue-50 border-blue-200'
    },
    {
      id: 'ast-2',
      name: 'Primary Health Centre (PHC Sub-Centre)',
      category: 'Health',
      status: 'Functional',
      coords: { x: 68, y: 35 },
      metrics: 'Doctor Visit: Mon/Thu • 94% Drug Inventory Sufficiency',
      lastInspected: 'Yesterday by Medical Officer',
      icon: Activity,
      color: 'bg-rose-600',
      textColor: 'text-rose-700',
      badgeBg: 'bg-rose-50 border-rose-200'
    },
    {
      id: 'ast-3',
      name: 'Zilla Parishad High School & Digital Lab',
      category: 'Education',
      status: 'Functional',
      coords: { x: 28, y: 64 },
      metrics: 'Classrooms: 12 • Student-Teacher Ratio 24:1 • Solar Powered',
      lastInspected: '5 days ago by Mandal Educational Officer',
      icon: GraduationCap,
      color: 'bg-indigo-600',
      textColor: 'text-indigo-700',
      badgeBg: 'bg-indigo-50 border-indigo-200'
    },
    {
      id: 'ast-4',
      name: 'Gram Panchayat Administrative Bhavan',
      category: 'Governance',
      status: 'Active',
      coords: { x: 50, y: 52 },
      metrics: 'Digital Registry Online • Citizen Common Service Desk',
      lastInspected: 'Daily Sarpanch / Panchayat Secretary attendance',
      icon: Building,
      color: 'bg-[#B87932]',
      textColor: 'text-[#B87932]',
      badgeBg: 'bg-amber-50 border-amber-200'
    },
  ];

  // Geotag active grievances onto the GIS field
  const grievancePins = grievances.slice(0, 3).map((g, idx) => {
    const coordsMap = [
      { x: 44, y: 38 },
      { x: 60, y: 68 },
      { x: 20, y: 45 }
    ];
    return {
      id: g.id,
      name: g.title,
      category: 'Issue',
      status: g.status,
      coords: coordsMap[idx] || { x: 30 + idx * 15, y: 35 + idx * 10 },
      metrics: `Category: ${g.category} • Case: ${g.id}`,
      lastInspected: `Reported on ${new Date(g.createdAt).toLocaleDateString()}`,
      icon: AlertCircle,
      color: g.status === 'Resolved' ? 'bg-emerald-600' : 'bg-amber-600',
      textColor: g.status === 'Resolved' ? 'text-emerald-700' : 'text-amber-700',
      badgeBg: g.status === 'Resolved' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
    };
  });

  const allItems = [...defaultAssets, ...grievancePins];
  const filteredItems = allItems.filter(item => {
    if (filterType === 'ALL') return true;
    if (filterType === 'WATER') return item.category === 'Water';
    if (filterType === 'HEALTH') return item.category === 'Health';
    if (filterType === 'SCHOOL') return item.category === 'Education';
    if (filterType === 'ISSUES') return item.category === 'Issue';
    return true;
  });

  return (
    <div className="bg-white border border-[#17352A]/10 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
      
      {/* Header with Title & Filter Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#17352A]/10 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-[#B87932] uppercase tracking-wider">
            {t?.gisMapSubtitle || "Geospatial Cadastral Asset Layer"}
          </span>
          <h3 className="font-heading font-bold text-xl text-[#17352A] mt-0.5 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-[#B87932]" />
            {t?.gisMapTitle || "Interactive Village GIS & Asset Map"}
          </h3>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 text-xs font-mono">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-bold ${
              filterType === 'ALL'
                ? 'bg-[#17352A] text-white border-[#17352A]'
                : 'bg-[#F5F1E7] text-[#17352A] border-[#17352A]/10 hover:border-[#B87932]'
            }`}
          >
            {t?.filterAll || "All"}
          </button>
          <button
            onClick={() => setFilterType('WATER')}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-bold ${
              filterType === 'WATER'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-[#F5F1E7] text-[#17352A] border-[#17352A]/10 hover:border-[#B87932]'
            }`}
          >
            💧 {t?.filterWater || "Water"}
          </button>
          <button
            onClick={() => setFilterType('HEALTH')}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-bold ${
              filterType === 'HEALTH'
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-[#F5F1E7] text-[#17352A] border-[#17352A]/10 hover:border-[#B87932]'
            }`}
          >
            🏥 {t?.filterHealth || "Health"}
          </button>
          <button
            onClick={() => setFilterType('SCHOOL')}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-bold ${
              filterType === 'SCHOOL'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-[#F5F1E7] text-[#17352A] border-[#17352A]/10 hover:border-[#B87932]'
            }`}
          >
            🏫 {t?.filterSchool || "School"}
          </button>
          <button
            onClick={() => setFilterType('ISSUES')}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-bold ${
              filterType === 'ISSUES'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-[#F5F1E7] text-[#17352A] border-[#17352A]/10 hover:border-[#B87932]'
            }`}
          >
            ⚠️ {t?.filterIssues || "Issues"}
          </button>
        </div>
      </div>

      {/* Main Interactive Map Field */}
      <div className="relative w-full h-96 bg-[#F5F1E7] border border-[#17352A]/15 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center select-none">
        
        {/* Background Cadastral Vector Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="gis-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#17352A" strokeWidth="0.75" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gis-grid)" />
          
          {/* Simulated village arterial roads and irrigation canal */}
          <path d="M 0 160 Q 250 180 500 130 T 900 170" fill="none" stroke="#B87932" strokeWidth="4" strokeDasharray="6 3" />
          <path d="M 320 0 Q 340 200 480 400" fill="none" stroke="#17352A" strokeWidth="3" />
          <path d="M 120 400 Q 400 240 750 0" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeOpacity="0.6" />
        </svg>

        {/* Legend / Coordinate watermark */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs border border-[#17352A]/15 px-3 py-1.5 rounded-xl text-[10px] font-mono text-[#17352A] shadow-xs">
          <strong>LGD Cadastral:</strong> {villageInfo.name} ({villageInfo.code}) • 17.91° N, 78.43° E
        </div>

        {/* Geo Asset & Grievance Pins */}
        {filteredItems.map(item => {
          const IconComponent = item.icon;
          const isSelected = selectedAsset?.id === item.id;
          
          return (
            <div
              key={item.id}
              style={{ left: `${item.coords.x}%`, top: `${item.coords.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
              onClick={() => setSelectedAsset(item)}
            >
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-full text-white shadow-lg transition-all duration-300 ${
                item.color
              } ${isSelected ? 'scale-125 ring-4 ring-amber-400 animate-bounce' : 'group-hover:scale-115'}`}>
                <IconComponent className="w-4 h-4" />
                
                {item.category === 'Issue' && item.status !== 'Resolved' && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </div>

              {/* Pin Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-20">
                <div className="bg-[#17352A] text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap">
                  {item.name}
                </div>
                <div className="w-2 h-2 bg-[#17352A] rotate-45 -mt-1"></div>
              </div>
            </div>
          );
        })}

        {/* Interactive Asset Detail Drawer / Card (when a pin is clicked) */}
        {selectedAsset && (
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white/95 backdrop-blur-md border border-[#17352A]/20 p-4 rounded-2xl shadow-xl z-20 animate-fade-in-up">
            <div className="flex justify-between items-start gap-2 border-b border-[#17352A]/10 pb-2 mb-2">
              <div>
                <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${selectedAsset.badgeBg} ${selectedAsset.textColor}`}>
                  {selectedAsset.category} • {selectedAsset.status}
                </span>
                <h4 className="font-heading font-bold text-sm text-[#17352A] mt-1">
                  {selectedAsset.name}
                </h4>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-xs font-mono font-bold text-[#5F7668] hover:text-[#17352A] px-1.5 py-0.5 rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <p className="text-xs text-[#17352A] font-medium leading-snug">
              {selectedAsset.metrics}
            </p>
            <span className="text-[10px] font-mono text-[#5F7668] block mt-2">
              📍 {selectedAsset.lastInspected}
            </span>
          </div>
        )}

      </div>

    </div>
  );
}
