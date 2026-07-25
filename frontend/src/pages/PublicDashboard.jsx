// src/pages/PublicDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Building, Users, Calendar, Activity, 
  TrendingUp, TrendingDown, RefreshCw, Droplet, GraduationCap, 
  Sprout, FileText, ShieldAlert, DollarSign, FileText as Scroll, 
  Phone, Plus, CheckCircle, AlertTriangle, AlertCircle, Clock
} from 'lucide-react';
import api from '../api';
import { toast } from 'react-toastify';

export default function PublicDashboard() {
  const { villageCode } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  // Tab for active domain details
  const [activeDomain, setActiveDomain] = useState('Water');

  // Grievance filing modal/form states
  const [showGrievanceForm, setShowGrievanceForm] = useState(false);
  const [grievanceForm, setGrievanceForm] = useState({
    title: '',
    category: 'Water',
    description: ''
  });

  // Fetch village dashboard details
  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/lgd/villages/${villageCode}`);
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching village details:', err);
        setError('Failed to load village dashboard. Please check LGD code.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [villageCode]);

  // Handle grievance form submit
  const handleGrievanceSubmit = (e) => {
    e.preventDefault();
    if (!grievanceForm.title || !grievanceForm.description) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // Add locally to the grievances list to show immediate feedback in demo
    const newGrievance = {
      id: `new-griv-${Date.now()}`,
      title: grievanceForm.title,
      category: grievanceForm.category,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      description: grievanceForm.description
    };
    
    setData(prev => ({
      ...prev,
      grievances: [newGrievance, ...prev.grievances]
    }));
    
    toast.success('Grievance filed successfully! Escaled to Mandal officer.');
    setShowGrievanceForm(false);
    setGrievanceForm({ title: '', category: 'Water', description: '' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-[#16241D]">
        <RefreshCw className="w-10 h-10 text-[#C98A2E] animate-spin mb-4" />
        <div className="text-[#F2F0E6]/60 font-semibold tracking-widest text-xs font-mono uppercase">
          Loading Village LGD Dashboard...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-[#16241D] px-6 text-center">
        <AlertTriangle className="w-16 h-16 text-[#C98A2E] mb-6" />
        <h2 className="font-heading text-3xl font-bold text-white mb-2">Error Loading Dashboard</h2>
        <p className="text-sm text-[#F2F0E6]/70 max-w-sm mb-6">{error || 'Village not found'}</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-[#C98A2E] hover:bg-[#b07824] text-[#16241D] font-bold text-sm px-6 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home Map
        </button>
      </div>
    );
  }

  const { villageInfo, metrics, officials, schemes, budgets, grievances } = data;
  const budget = budgets[0] || { totalAllocation: 0, totalSpent: 0, infrastructureAlloc: 0, welfareAlloc: 0 };
  const spentPercent = budget.totalAllocation > 0 ? Math.round((budget.totalSpent / budget.totalAllocation) * 100) : 0;

  // Domain descriptions for dynamic details tab
  const domainDetailsMap = {
    Water: {
      score: metrics.waterScore,
      risk: metrics.waterRisk,
      trend: metrics.waterTrend,
      desc: 'Monitors the status of clean drinking water supply pipelines, borewell function ratings, overhead water tank storage capacity, and water filtration assets.',
      indicators: [
        { label: 'Mission Bhagiratha Connection Rate', val: '98%' },
        { label: 'Borewell Functionality Index', val: '92/100' },
        { label: 'Fluoride Concentration Level', val: '0.2 ppm (Safe)' },
        { label: 'Average Daily Supply Duration', val: '2.5 Hours' }
      ]
    },
    Education: {
      score: metrics.educationScore,
      risk: metrics.educationRisk,
      trend: metrics.educationTrend,
      desc: 'Tracks primary and secondary government school infrastructure, classroom capacities, student-to-teacher ratios, and midday meal program consistency.',
      indicators: [
        { label: 'Student-Teacher Ratio', val: '24:1' },
        { label: 'Classroom Infrastructure Index', val: '86/100' },
        { label: 'Separate Toilet Sanitation', val: '100% Functional' },
        { label: 'Midday Meal Quality Audit Pass', val: 'Yes' }
      ]
    },
    Health: {
      score: metrics.healthScore,
      risk: metrics.healthRisk,
      trend: metrics.healthTrend,
      desc: 'Tracks local Primary Health Centre (PHC) operations, availability of essential medicine stocks, neonatal vaccines, and doctor/nurse attendance registers.',
      indicators: [
        { label: 'Medicine Stock Sufficiency', val: '94%' },
        { label: 'Staff Attendance Registry', val: '96.5%' },
        { label: 'Polio/Vaccine Stock Level', val: '100% Sufficient' },
        { label: 'Average PHC Wait Time', val: '12 Minutes' }
      ]
    },
    Agriculture: {
      score: metrics.agricultureScore,
      risk: metrics.agricultureRisk,
      trend: metrics.agricultureTrend,
      desc: 'Audits Rythu Bandhu farmer investment deposits, soil testing clinic accessibility, crop insurance enrollments, and local market yard transactions.',
      indicators: [
        { label: 'Rythu Bandhu Transfer Completion', val: '100%' },
        { label: 'Soil Testing Reports Distributed', val: '450 Farms' },
        { label: 'Crop Insurance Enrolled Farmers', val: '89%' },
        { label: 'Average Borewell Ground Level', val: '120 meters' }
      ]
    },
    Governance: {
      score: metrics.governanceScore,
      risk: metrics.governanceRisk,
      trend: metrics.governanceTrend,
      desc: 'Measures panchayat administrative speed, budget disclosure score, resolution rates of citizen grievances, and local meeting registers.',
      indicators: [
        { label: 'Grievance Resolution Speed', val: '4.2 Days Avg' },
        { label: 'Panchayat Budget Transparency Index', val: '95/100' },
        { label: 'Gram Sabha Meetings Held (Past Year)', val: '6 Sessions' },
        { label: 'Administrative Registry Audit', val: 'Pass' }
      ]
    }
  };

  const currentDomain = domainDetailsMap[activeDomain];

  return (
    <div className="min-h-screen bg-[#16241D] text-[#F2F0E6] font-sans selection:bg-[#C98A2E] selection:text-[#16241D] pb-24">
      
      {/* Top Banner Area */}
      <header className="bg-[#24382C]/50 border-b border-[#F2F0E6]/10 py-6 px-6 sticky top-0 backdrop-blur-md z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          {/* Back button and title */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="w-10 h-10 border border-[#F2F0E6]/15 hover:border-[#C98A2E] bg-[#16241D] rounded-xl flex items-center justify-center text-[#F2F0E6] hover:text-[#C98A2E] transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-white tracking-tight">
                  {villageInfo.name}
                </h1>
                <span className="text-[10px] font-mono font-bold tracking-wider bg-[#C98A2E]/10 text-[#C98A2E] border border-[#C98A2E]/25 px-2.5 py-0.5 rounded-full uppercase shrink-0">
                  Public Dashboard
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#F2F0E6]/60 mt-1">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#C98A2E]" /> Mandal: {villageInfo.mandalName}</span>
                <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5 text-[#C98A2E]" /> District: {villageInfo.districtName}</span>
                <span className="font-mono">LGD Code: {villageInfo.code}</span>
              </div>
            </div>
          </div>

          {/* Refresh and date info */}
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-mono text-[#F2F0E6]/40 uppercase tracking-widest font-bold">Audit Status</span>
            <div className="flex items-center gap-2 text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-[#C98A2E]" />
              <span>Last Audited: {new Date(metrics.lastUpdated).toLocaleDateString()}</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN - Development Index Radial (4 cols) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          
          {/* radial Development Score Card */}
          <div className="bg-[#24382C]/30 border border-[#F2F0E6]/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden glow-card">
            <span className="text-xs font-mono font-bold text-[#C98A2E] tracking-widest uppercase mb-4">Development Index</span>
            
            {/* Circular Gauge */}
            <div className="relative w-40 h-40 flex items-center justify-center mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="rgba(242,240,230,0.06)"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#C98A2E"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * metrics.developmentScore) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-heading font-black text-white font-mono-num leading-none">{metrics.developmentScore}</span>
                <span className="text-[10px] text-[#F2F0E6]/50 uppercase tracking-wider font-semibold mt-1">Score</span>
              </div>
            </div>

            {/* Risk banner */}
            <div className={`w-full border px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider mb-4 flex items-center justify-center gap-2 ${
              metrics.riskLevel === 'LOW' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
              metrics.riskLevel === 'MEDIUM' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
              'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                metrics.riskLevel === 'LOW' ? 'bg-green-500 animate-pulse' :
                metrics.riskLevel === 'MEDIUM' ? 'bg-yellow-500 animate-pulse' :
                'bg-red-500 animate-ping'
              }`} />
              AI Risk Rating: {metrics.riskLevel}
            </div>

            <p className="text-xs text-[#F2F0E6]/60 leading-relaxed font-light">
              This score calculates village development index across 5 vital sectors including water, health, schooling, agriculture, and panchayat administration compared against state targets.
            </p>
          </div>

          {/* Local Officials Directory */}
          <div className="bg-[#24382C]/30 border border-[#F2F0E6]/10 rounded-3xl p-6 flex flex-col gap-4 shadow-lg">
            <h3 className="font-heading font-bold text-lg text-white border-b border-[#F2F0E6]/5 pb-3">Officials Directory</h3>
            <div className="flex flex-col gap-4">
              {officials.map(o => (
                <div key={o.id} className="flex items-center justify-between border-b border-[#F2F0E6]/5 last:border-b-0 pb-3 last:pb-0">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">{o.name}</span>
                    <span className="text-[10px] text-[#C98A2E] font-mono uppercase tracking-wider">{o.designation}</span>
                  </div>
                  <a 
                    href={`tel:${o.contact}`} 
                    className="w-9 h-9 bg-[#16241D] hover:bg-[#C98A2E]/10 border border-[#F2F0E6]/10 hover:border-[#C98A2E] rounded-lg flex items-center justify-center text-[#C98A2E] transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* RIGHT COLUMN - Metrics details, budgets, grievances (8 cols) */}
        <section className="lg:col-span-8 flex flex-col gap-8">
          
          {/* 5 Domain Grid Cards */}
          <div>
            <h3 className="text-xs font-mono font-bold text-[#C98A2E] tracking-widest uppercase mb-4">Domain Metrics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              
              <button 
                onClick={() => setActiveDomain('Water')}
                className={`p-4 rounded-2xl flex flex-col items-center text-center border transition-all ${
                  activeDomain === 'Water' ? 'bg-[#24382C] border-[#C98A2E] shadow-md shadow-[#C98A2E]/10' : 'bg-[#24382C]/20 border-[#F2F0E6]/10 hover:border-[#F2F0E6]/30'
                }`}
              >
                <Droplet className={`w-6 h-6 mb-2 ${activeDomain === 'Water' ? 'text-[#C98A2E]' : 'text-blue-400'}`} />
                <span className="text-[10px] font-mono uppercase font-bold text-[#F2F0E6]/50">Water</span>
                <span className="font-heading font-black text-lg text-white mt-1">{metrics.waterScore}</span>
              </button>

              <button 
                onClick={() => setActiveDomain('Education')}
                className={`p-4 rounded-2xl flex flex-col items-center text-center border transition-all ${
                  activeDomain === 'Education' ? 'bg-[#24382C] border-[#C98A2E] shadow-md shadow-[#C98A2E]/10' : 'bg-[#24382C]/20 border-[#F2F0E6]/10 hover:border-[#F2F0E6]/30'
                }`}
              >
                <GraduationCap className={`w-6 h-6 mb-2 ${activeDomain === 'Education' ? 'text-[#C98A2E]' : 'text-indigo-400'}`} />
                <span className="text-[10px] font-mono uppercase font-bold text-[#F2F0E6]/50">Schooling</span>
                <span className="font-heading font-black text-lg text-white mt-1">{metrics.educationScore}</span>
              </button>

              <button 
                onClick={() => setActiveDomain('Health')}
                className={`p-4 rounded-2xl flex flex-col items-center text-center border transition-all ${
                  activeDomain === 'Health' ? 'bg-[#24382C] border-[#C98A2E] shadow-md shadow-[#C98A2E]/10' : 'bg-[#24382C]/20 border-[#F2F0E6]/10 hover:border-[#F2F0E6]/30'
                }`}
              >
                <Activity className={`w-6 h-6 mb-2 ${activeDomain === 'Health' ? 'text-[#C98A2E]' : 'text-red-400'}`} />
                <span className="text-[10px] font-mono uppercase font-bold text-[#F2F0E6]/50">Health</span>
                <span className="font-heading font-black text-lg text-white mt-1">{metrics.healthScore}</span>
              </button>

              <button 
                onClick={() => setActiveDomain('Agriculture')}
                className={`p-4 rounded-2xl flex flex-col items-center text-center border transition-all ${
                  activeDomain === 'Agriculture' ? 'bg-[#24382C] border-[#C98A2E] shadow-md shadow-[#C98A2E]/10' : 'bg-[#24382C]/20 border-[#F2F0E6]/10 hover:border-[#F2F0E6]/30'
                }`}
              >
                <Sprout className={`w-6 h-6 mb-2 ${activeDomain === 'Agriculture' ? 'text-[#C98A2E]' : 'text-green-400'}`} />
                <span className="text-[10px] font-mono uppercase font-bold text-[#F2F0E6]/50">Agri</span>
                <span className="font-heading font-black text-lg text-white mt-1">{metrics.agricultureScore}</span>
              </button>

              <button 
                onClick={() => setActiveDomain('Governance')}
                className={`p-4 rounded-2xl flex flex-col items-center text-center border transition-all col-span-2 sm:col-span-1 ${
                  activeDomain === 'Governance' ? 'bg-[#24382C] border-[#C98A2E] shadow-md shadow-[#C98A2E]/10' : 'bg-[#24382C]/20 border-[#F2F0E6]/10 hover:border-[#F2F0E6]/30'
                }`}
              >
                <ShieldAlert className={`w-6 h-6 mb-2 ${activeDomain === 'Governance' ? 'text-[#C98A2E]' : 'text-yellow-400'}`} />
                <span className="text-[10px] font-mono uppercase font-bold text-[#F2F0E6]/50">Governance</span>
                <span className="font-heading font-black text-lg text-white mt-1">{metrics.governanceScore}</span>
              </button>

            </div>
          </div>

          {/* Domain Detail Pane */}
          <div className="bg-[#24382C]/30 border border-[#F2F0E6]/10 rounded-3xl p-6 flex flex-col gap-6 shadow-lg">
            <div className="flex justify-between items-start border-b border-[#F2F0E6]/5 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#C98A2E] uppercase">Sector Focus</span>
                <h4 className="font-heading font-bold text-xl text-white mt-1">{activeDomain} Sector Details</h4>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono font-bold uppercase border px-3 py-1 rounded-lg ${
                  currentDomain.risk === 'LOW' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                  currentDomain.risk === 'MEDIUM' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                  'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {currentDomain.risk} Risk
                </span>
                <span className="text-xs bg-[#16241D] border border-[#F2F0E6]/10 px-2.5 py-1 rounded-lg font-mono flex items-center gap-1.5">
                  Trend: 
                  {currentDomain.trend === 'UP' && <TrendingUp className="w-3.5 h-3.5 text-green-400" />}
                  {currentDomain.trend === 'DOWN' && <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
                  {currentDomain.trend === 'STABLE' && <Clock className="w-3.5 h-3.5 text-yellow-400" />}
                  <span className="font-bold">{currentDomain.trend}</span>
                </span>
              </div>
            </div>

            <p className="text-xs md:text-sm text-[#F2F0E6]/80 leading-relaxed font-light">{currentDomain.desc}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {currentDomain.indicators.map((ind, i) => (
                <div key={i} className="bg-[#16241D]/55 border border-[#F2F0E6]/5 p-4 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-[#F2F0E6]/60 font-medium">{ind.label}</span>
                  <span className="font-mono text-sm font-bold text-[#C98A2E]">{ind.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Budget & Schemes Overview */}
          <div className="bg-[#24382C]/30 border border-[#F2F0E6]/10 rounded-3xl p-6 flex flex-col gap-6 shadow-lg">
            <div className="flex justify-between items-center border-b border-[#F2F0E6]/5 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#C98A2E] uppercase">Financial Disclosures</span>
                <h4 className="font-heading font-bold text-xl text-white mt-1">Village Budget & Scheme Allocations</h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#F2F0E6]/50 block">Year cycle</span>
                <span className="text-xs font-mono font-bold text-white">{budget.year}</span>
              </div>
            </div>

            {/* Spent progress bar */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-mono">
                <span>Budget Spent Progress</span>
                <span className="text-[#C98A2E] font-bold">{spentPercent}%</span>
              </div>
              <div className="w-full h-3 bg-[#16241D] rounded-full overflow-hidden border border-[#F2F0E6]/5">
                <div 
                  className="h-full bg-gradient-to-r from-[#C98A2E] to-green-500 transition-all duration-1000" 
                  style={{ width: `${spentPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#F2F0E6]/50 font-mono mt-1">
                <span>Total Spent: ₹{(budget.totalSpent / 100000).toFixed(1)} Lakhs</span>
                <span>Allocation: ₹{(budget.totalAllocation / 100000).toFixed(1)} Lakhs</span>
              </div>
            </div>

            {/* Allocation breakdown */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-[#16241D] border border-[#F2F0E6]/10 p-4 rounded-xl flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase text-[#F2F0E6]/50">Infrastructure Allocation</span>
                <span className="text-lg font-heading font-black text-white font-mono-num">₹{(budget.infrastructureAlloc / 100000).toFixed(2)} L</span>
                <span className="text-[9px] text-[#F2F0E6]/40 leading-none">Roads, pipelines, clinic repairs</span>
              </div>
              <div className="bg-[#16241D] border border-[#F2F0E6]/10 p-4 rounded-xl flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase text-[#F2F0E6]/50">Welfare Allocation</span>
                <span className="text-lg font-heading font-black text-white font-mono-num">₹{(budget.welfareAlloc / 100000).toFixed(2)} L</span>
                <span className="text-[9px] text-[#F2F0E6]/40 leading-none">Subsidies, health schemes, pensions</span>
              </div>
            </div>

            {/* Schemes list */}
            <div className="mt-4">
              <h5 className="text-xs font-mono font-bold text-[#C98A2E] uppercase tracking-wider mb-3">Scheme Implementation List</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#F2F0E6]/10 text-[#F2F0E6]/40 font-mono">
                      <th className="py-2.5 font-medium">Scheme Name</th>
                      <th className="py-2.5 font-medium">Allocation</th>
                      <th className="py-2.5 font-medium">Utilized</th>
                      <th className="py-2.5 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2F0E6]/5">
                    {schemes.map(s => (
                      <tr key={s.id} className="hover:bg-[#16241D]/20">
                        <td className="py-3 font-semibold text-white">{s.name}</td>
                        <td className="py-3 font-mono">₹{(s.allocatedBudget / 100000).toFixed(1)} L</td>
                        <td className="py-3 font-mono">₹{(s.spentBudget / 100000).toFixed(1)} L</td>
                        <td className="py-3 text-right">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${
                            s.status === 'Completed' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                            s.status === 'In Progress' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                            'bg-red-500/10 border-red-500/20 text-red-400'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Citizen Grievance Portal */}
          <div className="bg-[#24382C]/30 border border-[#F2F0E6]/10 rounded-3xl p-6 flex flex-col gap-6 shadow-lg">
            <div className="flex justify-between items-center border-b border-[#F2F0E6]/5 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#C98A2E] uppercase">Public Accountability</span>
                <h4 className="font-heading font-bold text-xl text-white mt-1">Citizen Grievances</h4>
              </div>
              <button
                onClick={() => setShowGrievanceForm(true)}
                className="bg-[#C98A2E]/10 hover:bg-[#C98A2E] border border-[#C98A2E]/30 text-[#C98A2E] hover:text-[#16241D] font-bold text-xs font-mono px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> File Grievance
              </button>
            </div>

            {/* File Grievance Dialog Overlay */}
            {showGrievanceForm && (
              <div className="bg-[#16241D]/95 border border-[#C98A2E]/20 p-6 rounded-2xl mt-2 animate-fade-in-up">
                <h5 className="font-heading font-bold text-lg text-white mb-4">Submit Public Grievance Form</h5>
                <form onSubmit={handleGrievanceSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-[#F2F0E6]/50 uppercase font-bold">Complaint Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Broken water pipeline on main street" 
                        value={grievanceForm.title}
                        onChange={(e) => setGrievanceForm(prev => ({ ...prev, title: e.target.value }))}
                        className="bg-[#24382C]/50 border border-[#F2F0E6]/10 focus:border-[#C98A2E] rounded-xl px-4 py-2.5 text-xs text-[#F2F0E6] outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-[#F2F0E6]/50 uppercase font-bold">Category Sector</label>
                      <select 
                        value={grievanceForm.category}
                        onChange={(e) => setGrievanceForm(prev => ({ ...prev, category: e.target.value }))}
                        className="bg-[#24382C]/50 border border-[#F2F0E6]/10 focus:border-[#C98A2E] rounded-xl px-4 py-2.5 text-xs text-[#F2F0E6] outline-none"
                      >
                        <option value="Water">Water Supply</option>
                        <option value="Education">Schooling</option>
                        <option value="Health">Health PHC</option>
                        <option value="Agriculture">Agriculture</option>
                        <option value="Governance">Governance / Panchayat</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-[#F2F0E6]/50 uppercase font-bold">Description Details</label>
                    <textarea 
                      rows="3" 
                      placeholder="Please specify address location, length of issue and details of the complaint..." 
                      value={grievanceForm.description}
                      onChange={(e) => setGrievanceForm(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-[#24382C]/50 border border-[#F2F0E6]/10 focus:border-[#C98A2E] rounded-xl px-4 py-2.5 text-xs text-[#F2F0E6] outline-none resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-3 mt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowGrievanceForm(false)}
                      className="border border-[#F2F0E6]/10 px-4 py-2 rounded-xl text-xs text-[#F2F0E6]/75"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-[#C98A2E] hover:bg-[#b07824] text-[#16241D] font-bold text-xs font-mono px-5 py-2.5 rounded-xl shadow-lg transition-all"
                    >
                      Submit & Escalate
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Grievances List */}
            <div className="flex flex-col gap-4">
              {grievances.map(g => (
                <div key={g.id} className="bg-[#16241D]/40 border border-[#F2F0E6]/10 p-5 rounded-2xl flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col">
                      <h5 className="font-heading font-bold text-sm text-white">{g.title}</h5>
                      <span className="text-[10px] text-[#F2F0E6]/40 font-mono mt-1">
                        Category: {g.category} • Date: {new Date(g.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border shrink-0 ${
                      g.status === 'Resolved' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                      g.status === 'Pending' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                      'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                    }`}>
                      {g.status === 'Resolved' && <CheckCircle className="w-3 h-3 text-green-400" />}
                      {g.status === 'Pending' && <AlertCircle className="w-3 h-3 text-red-400" />}
                      {g.status === 'Investigating' && <Clock className="w-3 h-3 text-yellow-400" />}
                      {g.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#F2F0E6]/60 leading-relaxed font-light">{g.description}</p>
                </div>
              ))}
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}
