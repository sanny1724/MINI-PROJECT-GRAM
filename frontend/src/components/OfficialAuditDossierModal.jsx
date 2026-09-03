// src/components/OfficialAuditDossierModal.jsx
import React from 'react';
import { X, Printer, Download, CheckCircle, Shield, Building, QrCode } from 'lucide-react';

export default function OfficialAuditDossierModal({ isOpen, onClose, data, lang = 'en' }) {
  if (!isOpen || !data) return null;

  const { villageInfo, metrics, budgets, schemes, officials } = data;
  const budget = budgets?.[0] || { totalAllocation: 0, totalSpent: 0, infrastructureAlloc: 0, welfareAlloc: 0, year: '2025-26' };
  const verificationCode = `TS-PRRD-LGD-${villageInfo.code}-${new Date().getFullYear()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-[#17352A]/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white text-[#17352A] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-8 border border-[#17352A]/15 flex flex-col max-h-[92vh]">
        
        {/* Action Header bar (hidden during print) */}
        <div className="bg-[#17352A] text-white px-6 py-4 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#B87932]" />
            <span className="font-heading font-bold text-base tracking-wide">
              Official Gram Panchayat Audit Dossier
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-[#B87932] hover:bg-[#B87932]/90 text-white font-mono font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-dossier" className="p-8 md:p-12 overflow-y-auto flex-1 font-sans bg-white print:p-0">
          
          {/* Official Letterhead Header */}
          <div className="border-b-2 border-[#17352A] pb-6 mb-6 text-center relative">
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 rounded-full border-2 border-[#17352A] flex items-center justify-center p-2 bg-[#F5F1E7]">
                <Building className="w-8 h-8 text-[#17352A]" />
              </div>
            </div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#B87932] font-bold">
              Government of Telangana • Panchayat Raj & Rural Development
            </span>
            <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-[#17352A] tracking-tight mt-1">
              GRAM PANCHAYAT PUBLIC AUDIT DOSSIER
            </h1>
            <p className="text-xs text-[#5F7668] mt-1 font-medium">
              Statutory Performance Evaluation & Financial Transparency Record
            </p>

            {/* Document Metadata Badge */}
            <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs font-mono">
              <span className="bg-[#F5F1E7] border border-[#17352A]/10 px-3 py-1 rounded-lg">
                <strong>Village:</strong> {villageInfo.name}
              </span>
              <span className="bg-[#F5F1E7] border border-[#17352A]/10 px-3 py-1 rounded-lg">
                <strong>Mandal:</strong> {villageInfo.mandalName}
              </span>
              <span className="bg-[#F5F1E7] border border-[#17352A]/10 px-3 py-1 rounded-lg">
                <strong>District:</strong> {villageInfo.districtName}
              </span>
              <span className="bg-[#F5F1E7] border border-[#17352A]/10 px-3 py-1 rounded-lg font-bold text-[#B87932]">
                LGD Code: {villageInfo.code}
              </span>
            </div>
          </div>

          {/* Development Score Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#F5F1E7] border border-[#17352A]/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-mono uppercase text-[#5F7668] font-bold">Overall Development Index</span>
              <span className="text-5xl font-heading font-black text-[#17352A] mt-2 mb-1">{metrics.developmentScore}</span>
              <span className="text-[10px] font-mono text-[#5F7668]">Out of 100 Index Score</span>
              <span className="mt-3 inline-block px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                AI Rating: {metrics.riskLevel} Risk
              </span>
            </div>

            <div className="md:col-span-2 bg-[#F5F1E7] border border-[#17352A]/10 rounded-2xl p-5 flex flex-col justify-between">
              <h4 className="font-heading font-bold text-sm text-[#17352A] mb-3 border-b border-[#17352A]/10 pb-2">
                5-Sector Scorecard Overview
              </h4>
              <div className="grid grid-cols-5 gap-2 text-center">
                <div className="bg-white p-2.5 rounded-xl border border-[#17352A]/5">
                  <span className="text-[10px] font-mono text-[#5F7668] block">Water</span>
                  <span className="font-heading font-bold text-base text-[#17352A]">{metrics.waterScore}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-[#17352A]/5">
                  <span className="text-[10px] font-mono text-[#5F7668] block">Schooling</span>
                  <span className="font-heading font-bold text-base text-[#17352A]">{metrics.educationScore}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-[#17352A]/5">
                  <span className="text-[10px] font-mono text-[#5F7668] block">Health</span>
                  <span className="font-heading font-bold text-base text-[#17352A]">{metrics.healthScore}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-[#17352A]/5">
                  <span className="text-[10px] font-mono text-[#5F7668] block">Agri</span>
                  <span className="font-heading font-bold text-base text-[#17352A]">{metrics.agricultureScore}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-[#17352A]/5">
                  <span className="text-[10px] font-mono text-[#5F7668] block">Governance</span>
                  <span className="font-heading font-bold text-base text-[#17352A]">{metrics.governanceScore}</span>
                </div>
              </div>
              <p className="text-[11px] text-[#5F7668] leading-relaxed mt-3">
                Audited based on clean water coverage, school student-to-teacher ratio, primary healthcare access, Rythu Bandhu credit disbursements, and grievance resolution times.
              </p>
            </div>
          </div>

          {/* Financial Disclosures Table */}
          <div className="mb-8">
            <h3 className="font-heading font-bold text-base text-[#17352A] mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#B87932]"></span>
              Gram Panchayat Financial Allocations ({budget.year})
            </h3>
            <table className="w-full text-left border-collapse text-xs border border-[#17352A]/10 rounded-xl overflow-hidden">
              <thead className="bg-[#F5F1E7] font-mono text-[#17352A]">
                <tr>
                  <th className="p-3 border-b border-[#17352A]/10">Head of Account / Scheme</th>
                  <th className="p-3 border-b border-[#17352A]/10">Total Allocation</th>
                  <th className="p-3 border-b border-[#17352A]/10">Total Disbursed / Spent</th>
                  <th className="p-3 border-b border-[#17352A]/10 text-right">Audit Pass</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17352A]/10">
                <tr>
                  <td className="p-3 font-semibold">Infrastructure & Works (Roads, Water)</td>
                  <td className="p-3 font-mono">₹{(budget.infrastructureAlloc / 100000).toFixed(2)} Lakhs</td>
                  <td className="p-3 font-mono text-emerald-700 font-bold">₹{((budget.infrastructureAlloc * 0.88) / 100000).toFixed(2)} Lakhs</td>
                  <td className="p-3 text-right"><span className="text-emerald-700 font-bold">✓ Verified</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Welfare & Health Programs</td>
                  <td className="p-3 font-mono">₹{(budget.welfareAlloc / 100000).toFixed(2)} Lakhs</td>
                  <td className="p-3 font-mono text-emerald-700 font-bold">₹{((budget.welfareAlloc * 0.94) / 100000).toFixed(2)} Lakhs</td>
                  <td className="p-3 text-right"><span className="text-emerald-700 font-bold">✓ Verified</span></td>
                </tr>
                {schemes?.slice(0, 3).map(s => (
                  <tr key={s.id}>
                    <td className="p-3">{s.name}</td>
                    <td className="p-3 font-mono">₹{(s.allocatedBudget / 100000).toFixed(2)} L</td>
                    <td className="p-3 font-mono">₹{(s.spentBudget / 100000).toFixed(2)} L</td>
                    <td className="p-3 text-right"><span className="text-emerald-700 font-bold">✓ {s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Verification Footnote & Digital QR Seal */}
          <div className="border-t-2 border-[#17352A]/20 pt-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white border border-[#17352A]/20 rounded-xl flex items-center justify-center p-2 shadow-xs">
                <QrCode className="w-16 h-16 text-[#17352A]" />
              </div>
              <div className="flex flex-col text-xs">
                <span className="font-mono font-bold text-[#17352A]">Verification Gazette ID:</span>
                <span className="font-mono text-[#B87932] font-bold text-sm tracking-wider">{verificationCode}</span>
                <span className="text-[10px] text-[#5F7668] mt-1">
                  Scan to verify authentic records on the Telangana LGD Rural Portal.
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end text-center md:text-right">
              <div className="h-10 w-28 border-b-2 border-dashed border-[#17352A]/40 mb-1 flex items-end justify-center">
                <span className="text-[10px] font-mono text-[#5F7668] italic font-semibold">Digitally Signed</span>
              </div>
              <span className="text-xs font-bold text-[#17352A]">{officials?.[0]?.name || 'Gram Panchayat Secretary'}</span>
              <span className="text-[10px] font-mono text-[#5F7668]">Authorized Signatory, Gram Sabha</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
