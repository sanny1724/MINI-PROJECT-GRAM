// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FileText, 
  DollarSign, 
  AlertTriangle, 
  ArrowRight, 
  Loader2,
  Activity,
  Compass,
  CheckCircle2,
  ShieldAlert,
  Building,
  Layers,
  ArrowLeft,
  User,
  Users
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api';

export default function Dashboard() {
  const { villageId, mandalId, districtId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Retrieve active user from cache
  const cachedUser = localStorage.getItem('stockflow_user');
  const user = cachedUser ? JSON.parse(cachedUser) : null;

  // Determine active view role and API endpoint
  let activeRole = user?.role || 'panchayat';
  let apiPath = '';
  let dashboardType = '';

  // Override role and endpoint if URL parameters are set
  if (villageId) {
    activeRole = 'panchayat';
    apiPath = `/dashboard/officer/village/${villageId}`;
    dashboardType = 'village';
  } else if (mandalId) {
    activeRole = 'tahsildar';
    apiPath = `/dashboard/officer/mandal/${mandalId}`;
    dashboardType = 'mandal';
  } else if (districtId) {
    activeRole = 'collector';
    apiPath = `/dashboard/officer/district/${districtId}`;
    dashboardType = 'district';
  } else if (window.location.pathname.includes('/officer/state') || activeRole === 'state') {
    activeRole = 'state';
    apiPath = '/dashboard/officer/state';
    dashboardType = 'state';
  } else {
    // Default fallback based on logged-in user profile
    if (activeRole === 'panchayat') {
      apiPath = `/dashboard/officer/village/${user.village_id || 4787}`;
      dashboardType = 'village';
    } else if (activeRole === 'tahsildar') {
      apiPath = `/dashboard/officer/mandal/${user.mandal_id || 493}`;
      dashboardType = 'mandal';
    } else if (activeRole === 'collector') {
      apiPath = `/dashboard/officer/district/${user.district_id || 16}`;
      dashboardType = 'district';
    } else if (activeRole === 'state') {
      apiPath = '/dashboard/officer/state';
      dashboardType = 'state';
    }
  }

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get(apiPath);
      setData(response.data);
    } catch (err) {
      console.error('Failed to fetch officer dashboard:', err);
      const msg = err.response?.data?.detail || 'Failed to retrieve administrative metrics.';
      toast.error(msg);
      // Navigate back or to home on forbidden/scope error
      if (err.response?.status === 403) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [apiPath]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-[#F5F1E7]">
        <Loader2 className="animate-spin text-[#B87932] mb-4" size={40} />
        <span className="text-xs font-mono text-[#17352A]/50">Loading administrative audit records...</span>
      </div>
    );
  }

  // Helper to format currency
  const formatINR = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // RENDER VILLAGE SECRETARY DASHBOARD
  if (dashboardType === 'village' && data) {
    const info = data.villageInfo;
    const metrics = data.metrics;
    
    return (
      <div className="p-6 space-y-8 overflow-y-auto h-full w-full max-w-7xl mx-auto custom-scroll">
        {/* Welcome Banner */}
        <div className="p-6 rounded-2xl glass border border-[#17352A]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-[#B87932]/5 blur-3xl"></div>
          <div className="space-y-1.5 z-10 text-left">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#B87932]/10 border border-[#B87932]/30 text-[#B87932] uppercase">
                Village Secretary Dashboard
              </span>
              <span className="text-[10px] font-mono text-[#17352A]/40">LGD: {info.code}</span>
            </div>
            <h2 className="text-3xl font-heading font-black text-[#17352A] tracking-tight">
              {info.name.toUpperCase()} VILLAGE
            </h2>
            <p className="text-[#17352A]/60 text-xs font-mono">
              {info.mandalName} Mandal • {info.districtName} District • Telangana State
            </p>
          </div>
          <Building className="text-[#B87932]/10 w-16 h-16 mr-4 hidden md:block" />
        </div>

        {/* Development & Risk Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-2xl glass border border-[#17352A]/10 flex flex-col justify-between h-36 text-left">
            <span className="text-[10px] font-mono font-bold text-[#17352A]/40 uppercase tracking-wider">Overall Development</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-4xl font-heading font-black text-[#17352A]">{metrics.developmentScore}</span>
              <span className="text-xs text-[#17352A]/40">/100</span>
            </div>
            <span className="text-[9px] text-[#17352A]/30">Weighted governance KPI index</span>
          </div>

          <div className="p-6 rounded-2xl glass border border-[#17352A]/10 flex flex-col justify-between h-36 text-left">
            <span className="text-[10px] font-mono font-bold text-[#17352A]/40 uppercase tracking-wider">AI Risk Level</span>
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-2.5 h-2.5 rounded-full animate-ping ${metrics.riskLevel === 'LOW' || metrics.riskLevel === 'Low' ? 'bg-green-500' : metrics.riskLevel === 'MEDIUM' || metrics.riskLevel === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <span className="text-2xl font-heading font-extrabold text-[#17352A] tracking-wide uppercase">{metrics.riskLevel}</span>
            </div>
            <span className="text-[9px] text-[#17352A]/30">Audit parameter classification</span>
          </div>

          <div className="p-6 rounded-2xl glass border border-[#17352A]/10 flex flex-col justify-between h-36 text-left">
            <span className="text-[10px] font-mono font-bold text-[#17352A]/40 uppercase tracking-wider">Public Officials</span>
            <div className="mt-2 flex flex-col gap-0.5 text-left">
              {data.officials.slice(0, 2).map((o, idx) => (
                <div key={idx} className="flex justify-between text-[10px]">
                  <span className="text-[#17352A]/70 truncate max-w-[100px]">{o.name}</span>
                  <span className="text-[#B87932]">{o.designation}</span>
                </div>
              ))}
            </div>
            <span className="text-[9px] text-[#17352A]/30">Assigned LGD representatives</span>
          </div>

          <div className="p-6 rounded-2xl glass border border-[#17352A]/10 flex flex-col justify-between h-36 text-left">
            <span className="text-[10px] font-mono font-bold text-[#17352A]/40 uppercase tracking-wider">Active Budget</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-heading font-black text-[#B87932]">
                {formatINR(data.budgets[0]?.totalAllocation || 6300000)}
              </span>
            </div>
            <span className="text-[9px] text-[#17352A]/30">Financial Year 2026-2027</span>
          </div>

        </div>

        {/* Domain Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            { name: "Water Supply", score: metrics.waterScore, risk: metrics.waterRisk, trend: metrics.waterTrend, color: "text-blue-400" },
            { name: "Education", score: metrics.educationScore, risk: metrics.educationRisk, trend: metrics.educationTrend, color: "text-purple-400" },
            { name: "Health Services", score: metrics.healthScore, risk: metrics.healthRisk, trend: metrics.healthTrend, color: "text-red-700" },
            { name: "Agriculture / Crops", score: metrics.agricultureScore, risk: metrics.agricultureRisk, trend: metrics.agricultureTrend, color: "text-green-700" },
            { name: "Governance Audit", score: metrics.governanceScore, risk: metrics.governanceRisk, trend: metrics.governanceTrend, color: "text-yellow-700" },
          ].map((dom, idx) => (
            <div key={idx} className="p-5 bg-[#F5F1E7]/35 border border-[#17352A]/10 rounded-2xl flex flex-col justify-between h-36 text-left">
              <span className="text-[10px] font-mono font-bold text-[#17352A]/40 uppercase">{dom.name}</span>
              <div className="flex justify-between items-baseline mt-2">
                <span className="text-3xl font-heading font-black text-[#17352A]">{dom.score}</span>
                <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${dom.risk === 'LOW' || dom.risk === 'Low' ? 'text-green-700 border-green-500/20 bg-green-500/10' : dom.risk === 'MEDIUM' || dom.risk === 'Medium' ? 'text-yellow-700 border-yellow-500/20 bg-yellow-500/10' : 'text-red-700 border-red-500/20 bg-red-500/10'}`}>{dom.risk}</span>
              </div>
              <div className="flex justify-between items-center text-[9px] text-[#17352A]/30">
                <span>Trend</span>
                <span className="text-[#B87932] font-semibold">{dom.trend}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Schemes, Budget and Grievances */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Schemes & Budgets */}
          <div className="lg:col-span-2 rounded-2xl glass border border-[#17352A]/10 p-6 flex flex-col justify-between min-h-[350px]">
            <div>
              <h3 className="font-heading font-bold text-base text-[#17352A] pb-3 border-b border-[#17352A]/10 mb-4 text-left">
                Assigned Government Development Schemes
              </h3>
              <div className="space-y-3">
                {data.schemes.map((s, idx) => (
                  <div key={idx} className="p-3 bg-[#F5F1E7]/45 border border-[#17352A]/5 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex flex-col gap-0.5 text-left">
                      <span className="font-semibold text-[#17352A]">{s.name}</span>
                      <span className="text-[9px] text-[#17352A]/40 font-mono">
                        Allocated: {formatINR(s.allocatedBudget)} • Spent: {formatINR(s.spentBudget)}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${s.status === 'Completed' ? 'text-green-700 border-green-500/20 bg-green-500/10' : 'text-yellow-700 border-yellow-500/20 bg-yellow-500/10'}`}>
                      {s.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t border-[#17352A]/5 pt-4 mt-4 flex justify-between items-center text-[10px] text-[#17352A]/40 font-mono">
              <span>Financial Year Audit Cycle</span>
              <span>LGD Secure Feed</span>
            </div>
          </div>

          {/* Grievances List */}
          <div className="rounded-2xl glass border border-[#17352A]/10 p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-[#17352A] pb-3 border-b border-[#17352A]/10 mb-4 text-left">
                Citizen Grievance Queue
              </h3>
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 custom-scroll">
                {data.grievances.map((g, idx) => (
                  <div key={idx} className="p-3 bg-[#F5F1E7]/45 border border-[#17352A]/5 rounded-xl text-left flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="px-1.5 py-0.5 bg-[#B87932]/10 border border-[#B87932]/25 text-[#B87932] rounded text-[8px] font-mono font-bold uppercase">{g.category}</span>
                      <span className={`px-1.5 py-0.5 text-[8px] font-mono font-bold border rounded-full ${g.status === 'Resolved' ? 'text-green-700 border-green-500/20 bg-green-500/10' : 'text-yellow-700 border-yellow-500/20 bg-yellow-500/10'}`}>{g.status.toUpperCase()}</span>
                    </div>
                    <span className="font-semibold text-[#17352A] text-[11px] truncate">{g.title}</span>
                    <p className="text-[9px] text-[#17352A]/50 leading-relaxed line-clamp-2">{g.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#17352A]/10 pt-4 mt-6">
              <Link 
                to="/products"
                className="w-full text-center bg-white border border-[#17352A]/10 hover:bg-white/80 text-[#B87932] font-mono font-bold rounded-xl py-2.5 px-4 text-xs block transition-all"
              >
                Launch Audit Action Portal
              </Link>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // RENDER MANDAL OFFICER DASHBOARD
  if (dashboardType === 'mandal' && data) {
    const info = data.mandalInfo;
    const stats = data.stats;
    
    return (
      <div className="p-6 space-y-8 overflow-y-auto h-full w-full max-w-7xl mx-auto custom-scroll">
        {/* Welcome Header */}
        <div className="p-6 rounded-2xl glass border border-[#17352A]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-[#B87932]/5 blur-3xl"></div>
          <div className="space-y-1.5 z-10 text-left">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#B87932]/10 border border-[#B87932]/30 text-[#B87932] uppercase">
              Mandal Officer Dashboard (Tahsildar)
            </span>
            <h2 className="text-3xl font-heading font-black text-[#17352A] tracking-tight">
              {info.name.toUpperCase()} MANDAL
            </h2>
            <p className="text-[#17352A]/60 text-xs font-mono">
              {info.districtName} District • Telangana State
            </p>
          </div>
          <Layers className="text-[#B87932]/10 w-16 h-16 mr-4 hidden md:block" />
        </div>

        {/* KPI Summaries */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl glass border border-[#17352A]/10 flex flex-col justify-between h-36 text-left">
            <span className="text-[10px] font-mono font-bold text-[#17352A]/40 uppercase tracking-wider">Total Villages</span>
            <h3 className="text-3xl font-heading font-black text-[#17352A] mt-2">{stats.totalVillages}</h3>
            <span className="text-[9px] text-[#17352A]/30">Subordinate village directory</span>
          </div>

          <div className="p-6 rounded-2xl glass border border-[#17352A]/10 flex flex-col justify-between h-36 text-left">
            <span className="text-[10px] font-mono font-bold text-[#17352A]/40 uppercase tracking-wider">Total Population</span>
            <h3 className="text-3xl font-heading font-black text-[#17352A] mt-2">{stats.totalPopulation.toLocaleString()}</h3>
            <span className="text-[9px] text-[#17352A]/30">Census records aggregation</span>
          </div>

          <div className="p-6 rounded-2xl glass border border-[#17352A]/10 flex flex-col justify-between h-36 text-left">
            <span className="text-[10px] font-mono font-bold text-[#17352A]/40 uppercase tracking-wider">Average Mandal Risk</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-heading font-black text-[#17352A]">{stats.averageRiskScore}</span>
              <span className="text-xs text-[#17352A]/40">/100</span>
            </div>
            <span className="text-[9px] text-[#17352A]/30">Risk-weighted audit indices</span>
          </div>

          <div className="p-6 rounded-2xl glass border border-[#17352A]/10 flex flex-col justify-between h-36 text-left">
            <span className="text-[10px] font-mono font-bold text-[#17352A]/40 uppercase tracking-wider">Critical Villages</span>
            <h3 className={`text-3xl font-heading font-black mt-2 ${stats.criticalVillagesCount > 0 ? 'text-red-700' : 'text-green-700'}`}>{stats.criticalVillagesCount}</h3>
            <span className="text-[9px] text-[#17352A]/30">Villages needing immediate action</span>
          </div>
        </div>

        {/* Subordinate Villages Table */}
        <div className="rounded-2xl glass border border-[#17352A]/10 p-6 flex flex-col text-left">
          <h3 className="font-heading font-bold text-base text-[#17352A] pb-3 border-b border-[#17352A]/10 mb-4">
            Subordinate Village Registry
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-[#17352A]/40 uppercase font-mono border-b border-[#17352A]/10">
                  <th className="py-2.5">Village Name</th>
                  <th className="py-2.5">LGD Code</th>
                  <th className="py-2.5 text-center">Population</th>
                  <th className="py-2.5 text-center">Risk Score</th>
                  <th className="py-2.5 text-center">Risk Level</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F0E6]/5 text-[#17352A]/80">
                {data.villages.map((v) => (
                  <tr key={v.id} className="hover:bg-white/80 transition-colors">
                    <td className="py-3 font-semibold text-[#17352A]">{v.name}</td>
                    <td className="py-3 font-mono text-[#B87932]">{v.lgd_code}</td>
                    <td className="py-3 text-center font-mono-num">{v.population?.toLocaleString() || 0}</td>
                    <td className="py-3 text-center font-mono-num font-semibold">{v.risk_score}</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${v.risk_level === 'Low' || v.risk_level === 'LOW' ? 'text-green-700 border-green-500/20 bg-green-500/10' : v.risk_level === 'Medium' ? 'text-yellow-700 border-yellow-500/20 bg-yellow-500/10' : 'text-red-700 border-red-500/20 bg-red-500/10'}`}>
                        {v.risk_level.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => navigate(`/officer/village/${v.id}`)}
                        className="text-xs text-[#B87932] hover:underline font-semibold flex items-center gap-1 ml-auto"
                      >
                        Explore Village <ArrowRight size={10} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // RENDER DISTRICT OFFICER DASHBOARD
  if (dashboardType === 'district' && data) {
    const info = data.districtInfo;
    const stats = data.stats;
    
    return (
      <div className="p-6 space-y-8 overflow-y-auto h-full w-full max-w-7xl mx-auto custom-scroll">
        {/* Welcome Header */}
        <div className="p-6 rounded-2xl glass border border-[#17352A]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-[#B87932]/5 blur-3xl"></div>
          <div className="space-y-1.5 z-10 text-left">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#B87932]/10 border border-[#B87932]/30 text-[#B87932] uppercase">
              District Officer Dashboard (Collector)
            </span>
            <h2 className="text-3xl font-heading font-black text-[#17352A] tracking-tight">
              {info.name.toUpperCase()} DISTRICT
            </h2>
            <p className="text-[#17352A]/60 text-xs font-mono">
              Telangana State Governance Portal
            </p>
          </div>
          <Activity className="text-[#B87932]/10 w-16 h-16 mr-4 hidden md:block" />
        </div>

        {/* District KPI Summaries */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl glass border border-[#17352A]/10 flex flex-col justify-between h-36 text-left">
            <span className="text-[10px] font-mono font-bold text-[#17352A]/40 uppercase tracking-wider">Total Mandals</span>
            <h3 className="text-3xl font-heading font-black text-[#17352A] mt-2">{stats.totalMandals}</h3>
            <span className="text-[9px] text-[#17352A]/30">Sub-districts admin zones</span>
          </div>

          <div className="p-6 rounded-2xl glass border border-[#17352A]/10 flex flex-col justify-between h-36 text-left">
            <span className="text-[10px] font-mono font-bold text-[#17352A]/40 uppercase tracking-wider">Total Villages</span>
            <h3 className="text-3xl font-heading font-black text-[#17352A] mt-2">{stats.totalVillages}</h3>
            <span className="text-[9px] text-[#17352A]/30">Assigned village directory</span>
          </div>

          <div className="p-6 rounded-2xl glass border border-[#17352A]/10 flex flex-col justify-between h-36 text-left">
            <span className="text-[10px] font-mono font-bold text-[#17352A]/40 uppercase tracking-wider">Average District Risk</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-heading font-black text-[#17352A]">{stats.averageRiskScore}</span>
              <span className="text-xs text-[#17352A]/40">/100</span>
            </div>
            <span className="text-[9px] text-[#17352A]/30">Weighted audit performance</span>
          </div>

          <div className="p-6 rounded-2xl glass border border-[#17352A]/10 flex flex-col justify-between h-36 text-left">
            <span className="text-[10px] font-mono font-bold text-[#17352A]/40 uppercase tracking-wider">Critical Villages</span>
            <h3 className={`text-3xl font-heading font-black mt-2 ${stats.criticalVillagesCount > 0 ? 'text-red-700' : 'text-green-700'}`}>{stats.criticalVillagesCount}</h3>
            <span className="text-[9px] text-[#17352A]/30">Villages needing immediate action</span>
          </div>
        </div>

        {/* Mandals Grid & Village Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          
          {/* Mandals list */}
          <div className="rounded-2xl glass border border-[#17352A]/10 p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-[#17352A] pb-3 border-b border-[#17352A]/10 mb-4">
                Mandal Sub-divisions
              </h3>
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 custom-scroll">
                {data.mandals.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => navigate(`/officer/mandal/${m.id}`)}
                    className="w-full text-left p-3.5 bg-[#F5F1E7]/55 hover:bg-[#B87932]/10 border border-[#17352A]/5 hover:border-[#B87932]/30 rounded-xl text-xs font-semibold text-[#17352A] hover:text-[#B87932] transition-all flex justify-between items-center group"
                  >
                    <div className="flex flex-col gap-0.5 text-left">
                      <span className="font-semibold truncate">{m.name}</span>
                      <span className="text-[8px] font-mono text-[#17352A]/40">{m.totalVillages} villages</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#17352A]/20 group-hover:text-[#B87932] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="border-t border-[#17352A]/5 pt-3 mt-4 text-[9px] font-mono text-[#17352A]/30">
              LGD Sub-divisions: Active
            </div>
          </div>

          {/* Villages overview */}
          <div className="lg:col-span-2 rounded-2xl glass border border-[#17352A]/10 p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-[#17352A] pb-3 border-b border-[#17352A]/10 mb-4">
                Subordinate Village Registry
              </h3>
              <div className="overflow-x-auto max-h-[300px] custom-scroll">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-[#17352A]/40 uppercase font-mono border-b border-[#17352A]/10">
                      <th className="py-2.5">Village</th>
                      <th className="py-2.5">Mandal</th>
                      <th className="py-2.5 text-center">Risk Score</th>
                      <th className="py-2.5 text-center">Risk Level</th>
                      <th className="py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2F0E6]/5 text-[#17352A]/80">
                    {data.villages.slice(0, 50).map((v) => (
                      <tr key={v.id} className="hover:bg-white/80 transition-colors">
                        <td className="py-3 font-semibold text-[#17352A]">{v.name}</td>
                        <td className="py-3 font-mono text-[#B87932]">{v.mandal_name}</td>
                        <td className="py-3 text-center font-mono-num font-semibold">{v.risk_score}</td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${v.risk_level === 'Low' || v.risk_level === 'LOW' ? 'text-green-700 border-green-500/20 bg-green-500/10' : v.risk_level === 'Medium' ? 'text-yellow-700 border-yellow-500/20 bg-yellow-500/10' : 'text-red-700 border-red-500/20 bg-red-500/10'}`}>
                            {v.risk_level.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => navigate(`/officer/village/${v.id}`)}
                            className="text-[10px] text-[#B87932] hover:underline font-semibold"
                          >
                            Explore
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t border-[#17352A]/5 pt-3 mt-4 text-[9px] font-mono text-[#17352A]/30 text-right">
              Showing first 50 villages
            </div>
          </div>

        </div>
      </div>
    );
  }

  // RENDER STATE OFFICER DASHBOARD
  if (dashboardType === 'state' && data) {
    const stats = data.stats;
    
    return (
      <div className="p-6 space-y-8 overflow-y-auto h-full w-full max-w-7xl mx-auto custom-scroll">
        {/* Welcome Header */}
        <div className="p-6 rounded-2xl glass border border-[#17352A]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-[#B87932]/5 blur-3xl"></div>
          <div className="space-y-1.5 z-10 text-left">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#B87932]/10 border border-[#B87932]/30 text-[#B87932] uppercase">
              State Officer Dashboard
            </span>
            <h2 className="text-3xl font-heading font-black text-[#17352A] tracking-tight">
              TELANGANA STATE WORKSPACE
            </h2>
            <p className="text-[#17352A]/60 text-xs font-mono">
              Highest Governance level (Apex Console)
            </p>
          </div>
          <ShieldAlert className="text-[#B87932]/10 w-16 h-16 mr-4 hidden md:block" />
        </div>

        {/* State KPI Summaries */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl glass border border-[#17352A]/10 flex flex-col justify-between h-36 text-left">
            <span className="text-[10px] font-mono font-bold text-[#17352A]/40 uppercase tracking-wider">Total Districts</span>
            <h3 className="text-3xl font-heading font-black text-[#17352A] mt-2">{stats.totalDistricts}</h3>
            <span className="text-[9px] text-[#17352A]/30">Active district collectives</span>
          </div>

          <div className="p-6 rounded-2xl glass border border-[#17352A]/10 flex flex-col justify-between h-36 text-left">
            <span className="text-[10px] font-mono font-bold text-[#17352A]/40 uppercase tracking-wider">Total Mandals</span>
            <h3 className="text-3xl font-heading font-black text-[#17352A] mt-2">{stats.totalMandals}</h3>
            <span className="text-[9px] text-[#17352A]/30">Assigned mandal divisions</span>
          </div>

          <div className="p-6 rounded-2xl glass border border-[#17352A]/10 flex flex-col justify-between h-36 text-left">
            <span className="text-[10px] font-mono font-bold text-[#17352A]/40 uppercase tracking-wider">Total Villages</span>
            <h3 className="text-3xl font-heading font-black text-[#17352A] mt-2">{stats.totalVillages.toLocaleString()}</h3>
            <span className="text-[9px] text-[#17352A]/30">Complete LGD directory scope</span>
          </div>

          <div className="p-6 rounded-2xl glass border border-[#17352A]/10 flex flex-col justify-between h-36 text-left">
            <span className="text-[10px] font-mono font-bold text-[#17352A]/40 uppercase tracking-wider">State Dev Score Index</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-heading font-black text-[#B87932]">{stats.averageRiskScore}</span>
              <span className="text-xs text-[#17352A]/40">/100</span>
            </div>
            <span className="text-[9px] text-[#17352A]/30">State-wide sample average</span>
          </div>
        </div>

        {/* State Grid & Critical Warnings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          
          {/* Districts Directory */}
          <div className="rounded-2xl glass border border-[#17352A]/10 p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-[#17352A] pb-3 border-b border-[#17352A]/10 mb-4">
                District Divisions Directory
              </h3>
              <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scroll">
                {data.districts.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => navigate(`/officer/district/${d.id}`)}
                    className="p-3 bg-[#F5F1E7]/55 hover:bg-[#B87932]/10 border border-[#17352A]/5 hover:border-[#B87932]/30 rounded-xl text-[10px] font-mono font-bold text-[#17352A] hover:text-[#B87932] transition-all text-center"
                  >
                    {d.name.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="border-t border-[#17352A]/5 pt-3 mt-4 text-[9px] font-mono text-[#17352A]/30 text-center">
              Click to view district collector audits
            </div>
          </div>

          {/* Critical Village Warnings */}
          <div className="lg:col-span-2 rounded-2xl glass border border-[#17352A]/10 p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-[#17352A] pb-3 border-b border-[#17352A]/10 mb-4 flex items-center gap-2">
                <ShieldAlert className="text-red-700 animate-pulse" size={18} />
                Critical Village Intervention Alerts
              </h3>
              <div className="space-y-3.5">
                {data.criticalVillages.length > 0 ? (
                  data.criticalVillages.map((v, idx) => (
                    <div key={idx} className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between text-xs hover:border-red-500/40 transition-colors">
                      <div className="flex flex-col gap-0.5 text-left">
                        <span className="font-semibold text-[#17352A] text-[13px]">{v.name.toUpperCase()}</span>
                        <span className="text-[9px] text-[#17352A]/40 font-mono">
                          {v.mandal_name} Mandal • {v.district_name} District
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-red-700 font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                          SCORE: {v.risk_score}
                        </span>
                        <button
                          onClick={() => navigate(`/officer/village/${v.id}`)}
                          className="text-xs text-[#B87932] hover:underline font-semibold"
                        >
                          Audit Village
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-[#17352A]/40 gap-2">
                    <CheckCircle2 size={40} className="text-[#B87932]" />
                    <p className="text-sm font-medium">All villages are operating within safe indices!</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-[#17352A]/5 pt-3 mt-4 text-[9px] font-mono text-[#17352A]/30 text-right">
              State Governance Real-time Alerts Feed
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full w-full bg-[#F5F1E7]">
      <Loader2 className="animate-spin text-[#B87932]" size={36} />
    </div>
  );
}
