// src/components/VillageComparisonModal.jsx
import React from 'react';
import { X, Award, BarChart3, TrendingUp, CheckCircle, MapPin, ArrowRight } from 'lucide-react';

export default function VillageComparisonModal({ isOpen, onClose, currentVillage, metrics, t }) {
  if (!isOpen) return null;

  const comparisonData = [
    {
      name: currentVillage?.name || 'Jamsing Lingapur',
      isCurrent: true,
      rank: 3,
      devScore: metrics?.developmentScore || 23,
      waterPurity: '98%',
      teacherRatio: '24:1',
      resolutionDays: '4.2 Days',
      budgetUtil: '78%'
    },
    {
      name: 'Ramayampet Rural',
      isCurrent: false,
      rank: 1,
      devScore: 84,
      waterPurity: '99%',
      teacherRatio: '20:1',
      resolutionDays: '2.8 Days',
      budgetUtil: '94%'
    },
    {
      name: 'Gajularamaram GP',
      isCurrent: false,
      rank: 2,
      devScore: 79,
      waterPurity: '95%',
      teacherRatio: '22:1',
      resolutionDays: '3.5 Days',
      budgetUtil: '86%'
    },
    {
      name: 'Mandal Average',
      isCurrent: false,
      rank: '-',
      devScore: 61,
      waterPurity: '88%',
      teacherRatio: '29:1',
      resolutionDays: '6.1 Days',
      budgetUtil: '72%'
    },
  ];

  return (
    <div className="fixed inset-0 bg-[#17352A]/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white text-[#17352A] w-full max-w-3xl rounded-3xl shadow-2xl border border-[#17352A]/15 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#17352A] text-white px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#B87932] flex items-center justify-center text-white">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#B87932] uppercase tracking-wider font-bold">
                {t.benchmarkSubtitle}
              </span>
              <h3 className="font-heading font-bold text-lg text-white">
                {t.benchmarkTitle}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 md:p-8 overflow-y-auto flex flex-col gap-6">
          
          {/* Highlight Badge */}
          <div className="bg-[#F5F1E7] border border-[#17352A]/10 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#B87932] text-white flex items-center justify-center font-heading font-black text-xl shadow-xs">
                #3
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-[#B87932] uppercase">{t.mandalRank}</span>
                <h4 className="font-heading font-bold text-base text-[#17352A]">{t.rankOf}</h4>
                <p className="text-[11px] text-[#5F7668]">Outperforming 21 other Gram Panchayats in drinking water infrastructure.</p>
              </div>
            </div>

            <div className="text-center sm:text-right font-mono text-xs">
              <span className="text-[#5F7668] block">Mandal: {currentVillage?.mandalName || 'Ramayampet'}</span>
              <span className="text-[#17352A] font-bold">District: {currentVillage?.districtName || 'Medak'}</span>
            </div>
          </div>

          {/* Comparative Metrics Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs border border-[#17352A]/10 rounded-xl overflow-hidden">
              <thead className="bg-[#F5F1E7] font-mono text-[#17352A]">
                <tr>
                  <th className="p-3 border-b border-[#17352A]/10">{t.compareVillage}</th>
                  <th className="p-3 border-b border-[#17352A]/10">{t.compareIndex}</th>
                  <th className="p-3 border-b border-[#17352A]/10">{t.compareWater}</th>
                  <th className="p-3 border-b border-[#17352A]/10">{t.compareSchool}</th>
                  <th className="p-3 border-b border-[#17352A]/10">{t.compareResolution}</th>
                  <th className="p-3 border-b border-[#17352A]/10 text-right">{t.compareUtilization}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17352A]/10">
                {comparisonData.map((row, idx) => (
                  <tr 
                    key={idx} 
                    className={`${row.isCurrent ? 'bg-amber-500/10 font-bold' : 'hover:bg-[#F5F1E7]/40'} transition-colors`}
                  >
                    <td className="p-3 flex items-center gap-1.5">
                      {row.isCurrent && <span className="w-2 h-2 rounded-full bg-[#B87932]" />}
                      <span className={row.isCurrent ? 'text-[#B87932] font-bold' : 'text-[#17352A]'}>
                        {row.name} {row.isCurrent ? '(This Village)' : ''}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-black text-sm text-[#17352A]">{row.devScore}</td>
                    <td className="p-3 font-mono text-blue-700">{row.waterPurity}</td>
                    <td className="p-3 font-mono text-indigo-700">{row.teacherRatio}</td>
                    <td className="p-3 font-mono text-emerald-700">{row.resolutionDays}</td>
                    <td className="p-3 font-mono text-right text-[#17352A]">{row.budgetUtil}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Visual Benchmark Score Bars */}
          <div className="bg-[#F5F1E7] border border-[#17352A]/10 p-5 rounded-2xl flex flex-col gap-3">
            <h5 className="font-heading font-bold text-xs text-[#17352A] uppercase tracking-wider">
              Development Index Benchmark (Visual Spread)
            </h5>
            
            <div className="flex flex-col gap-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span>#1 Ramayampet Rural (Mandal Leader)</span>
                  <span className="font-bold">84 / 100</span>
                </div>
                <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '84%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-bold text-[#B87932]">#3 {currentVillage?.name || 'Jamsing Lingapur'} (Current)</span>
                  <span className="font-bold text-[#B87932]">{metrics?.developmentScore || 23} / 100</span>
                </div>
                <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#B87932] rounded-full" style={{ width: `${metrics?.developmentScore || 23}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1 text-[#5F7668]">
                  <span>Mandal Average (24 Villages)</span>
                  <span>61 / 100</span>
                </div>
                <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                  <div className="h-full bg-stone-400 rounded-full" style={{ width: '61%' }} />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
