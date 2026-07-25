// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  DollarSign, 
  AlertTriangle, 
  ArrowRight, 
  TrendingUp, 
  Loader2,
  Activity,
  Compass,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard');
      setData(response.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      toast.error('Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#16241D]">
        <Loader2 className="animate-spin text-[#C98A2E]" size={36} />
      </div>
    );
  }

  const kpis = [
    {
      title: 'Active Welfare Schemes',
      value: data?.totalProducts || 0,
      description: 'Active developmental schemes',
      icon: FileText,
      glow: 'shadow-[#C98A2E]/5 border-[#F2F0E6]/10',
      iconBg: 'bg-[#C98A2E]/10 text-[#C98A2E]',
    },
    {
      title: 'Total Allocated Budget',
      value: `₹ ${(data?.totalInventoryUnits / 100000 || 0).toFixed(1)} L`,
      description: 'Aggregated funds allocated',
      icon: DollarSign,
      glow: 'shadow-[#C98A2E]/5 border-[#F2F0E6]/10',
      iconBg: 'bg-[#C98A2E]/10 text-[#C98A2E]',
    },
    {
      title: 'Pending Citizen Grievances',
      value: data?.lowStockCount || 0,
      description: 'Logged reports requiring resolution',
      icon: AlertTriangle,
      glow: data?.lowStockCount > 0 ? 'shadow-red-500/10 border-red-500/20' : 'shadow-emerald-500/5 border-[#F2F0E6]/10',
      iconBg: data?.lowStockCount > 0 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-green-400',
    },
  ];

  return (
    <div className="p-6 space-y-8 overflow-y-auto h-full w-full max-w-7xl mx-auto custom-scroll">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl glass border border-[#F2F0E6]/10 flex items-center justify-between relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-[#C98A2E]/5 blur-3xl"></div>
        <div className="space-y-1 z-10">
          <h2 className="text-2xl font-heading font-extrabold text-white tracking-tight">Officer Admin Workspace</h2>
          <p className="text-[#F2F0E6]/60 text-sm">Review village development statistics, scheme budgets, and handle citizen grievances from a unified portal.</p>
        </div>
        <Compass className="text-[#C98A2E]/10 w-16 h-16 mr-4 hidden md:block" />
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={idx} 
              className={`p-6 rounded-2xl glass border shadow-xl flex flex-col justify-between h-44 hover:translate-y-[-2px] transition-all duration-300 ${kpi.glow}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#F2F0E6]/50 text-xs font-mono font-bold uppercase tracking-wider">{kpi.title}</p>
                  <h3 className="text-3xl font-heading font-black text-white mt-2 tracking-tight">
                    {kpi.value}
                  </h3>
                </div>
                <div className={`p-3 rounded-xl ${kpi.iconBg}`}>
                  <Icon size={22} />
                </div>
              </div>
              <p className="text-[#F2F0E6]/40 text-xs flex items-center gap-1.5 font-medium mt-4">
                {kpi.title === 'Pending Citizen Grievances' && data?.lowStockCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                    Needs Action
                  </span>
                ) : kpi.title === 'Pending Citizen Grievances' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                    All Resolved
                  </span>
                ) : null}
                <span>{kpi.description}</span>
              </p>
            </div>
          );
        })}
      </div>

      {/* Low Stock Warning Table & Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table list - takes 2 cols on lg, 1 on md */}
        <div className="lg:col-span-2 rounded-2xl glass border border-[#F2F0E6]/10 p-6 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#F2F0E6]/10">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-red-400 animate-pulse" size={18} />
                <h3 className="font-heading font-bold text-base text-white">Critical Grievances Needing Action</h3>
              </div>
              <span className="text-xs font-mono font-bold text-[#C98A2E] bg-[#C98A2E]/10 border border-[#C98A2E]/25 px-2.5 py-1 rounded-full">
                {data?.lowStockCount || 0} open reports
              </span>
            </div>

            {/* List */}
            {data?.lowStockAlerts && data.lowStockAlerts.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-[#F2F0E6]/40 uppercase font-mono border-b border-[#F2F0E6]/10">
                      <th className="py-2.5">Grievance Description</th>
                      <th className="py-2.5">Category</th>
                      <th className="py-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2F0E6]/5 text-[#F2F0E6]/80">
                    {data.lowStockAlerts.map((item) => (
                      <tr key={item.id} className="hover:bg-[#24382C]/20 transition-colors">
                        <td className="py-3 font-semibold text-white">{item.name}</td>
                        <td className="py-3 font-mono text-[#C98A2E]">{item.sku}</td>
                        <td className="py-3 text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                            PENDING
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-[#F2F0E6]/40 gap-2">
                <CheckCircle2 size={40} className="text-[#C98A2E]" />
                <p className="text-sm font-medium">All citizen grievances are fully resolved!</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#F2F0E6]/10 mt-4 flex justify-end">
            <Link 
              to="/products" 
              className="text-xs text-[#C98A2E] hover:underline font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Manage Welfare Schemes</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* LGD Audit Info Card */}
        <div className="rounded-2xl glass border border-[#F2F0E6]/10 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="pb-4 border-b border-[#F2F0E6]/10">
              <h3 className="font-heading font-bold text-base text-white">LGD Village Parameters</h3>
            </div>
            
            <div className="space-y-3.5 mt-2">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-[#F2F0E6]/50 tracking-wider">Overall Health Index</span>
                <p className="text-lg font-heading font-black text-[#C98A2E] font-mono-num">
                  {data?.developmentScore || 87} / 100
                </p>
              </div>
              
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-[#F2F0E6]/50 tracking-wider">AI Risk Classification</span>
                <p className="text-sm font-heading font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                  {data?.riskLevel || 'LOW'} RISK
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-[#F2F0E6]/50 tracking-wider">Audit Security Isolation</span>
                <p className="text-xs leading-relaxed text-[#F2F0E6]/70 font-light bg-[#16241D] border border-[#F2F0E6]/5 p-2.5 rounded-xl">
                  Prisma scoped queries ensure officers only have administrative management access to LGD resources belonging to their assigned code register.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#F2F0E6]/10 mt-6">
            <Link 
              to="/settings"
              className="w-full text-center bg-[#24382C] border border-[#F2F0E6]/10 hover:bg-[#24382C]/80 text-white font-mono font-bold rounded-xl py-2.5 px-4 text-xs block transition-all"
            >
              Configure Office Code
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
