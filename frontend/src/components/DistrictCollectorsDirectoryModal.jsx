// src/components/DistrictCollectorsDirectoryModal.jsx
import React, { useState } from 'react';
import { X, Search, Phone, Mail, ExternalLink, ShieldCheck, Building } from 'lucide-react';
import { TELANGANA_DISTRICT_COLLECTORS } from '../data/districtCollectors';

export default function DistrictCollectorsDirectoryModal({ isOpen, onClose, currentDistrict = '', lang = 'en' }) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredCollectors = TELANGANA_DISTRICT_COLLECTORS.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    return (
      c.district.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-[#F5F1E7] border border-[#17352A]/20 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#17352A] text-white p-6 flex items-center justify-between border-b border-[#B87932]/30 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-[#B87932]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0">
              <img src="/telangana-seal.png" alt="Government of Telangana Emblem" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-xl text-[#F5F1E7] tracking-tight">
                  Telangana District Collectors Directory
                </h2>
                <span className="text-[10px] font-mono font-bold bg-[#B87932] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                  33 Districts (IAS)
                </span>
              </div>
              <p className="text-xs text-[#F5F1E7]/70 mt-0.5 font-mono">
                Official Directory of District Magistrates & Collectors • Government of Telangana
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 z-10"
            title="Close Directory"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 bg-white/80 border-b border-[#17352A]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-[#17352A]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by District name, Collector name..."
              className="w-full pl-9.5 pr-4 py-2 bg-[#F5F1E7]/60 border border-[#17352A]/15 rounded-xl text-xs text-[#17352A] placeholder:text-[#17352A]/40 focus:outline-none focus:border-[#B87932] focus:bg-white transition-all font-medium"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-[#5F7668] self-end sm:self-auto">
            <span>Showing <strong className="text-[#17352A]">{filteredCollectors.length}</strong> of 33 Collectors</span>
            <a 
              href="https://www.telangana.gov.in/contacts/district-officials/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#B87932] hover:underline font-semibold"
            >
              <span>Portal Source</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Collectors Grid List */}
        <div className="p-6 overflow-y-auto flex-1 divide-y divide-[#17352A]/10 space-y-3">
          {filteredCollectors.length === 0 ? (
            <div className="py-12 text-center text-[#5F7668] flex flex-col items-center">
              <Search className="w-8 h-8 text-[#17352A]/30 mb-2" />
              <p className="text-sm font-medium">No District Collector found matching "{searchQuery}"</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-3 text-xs font-mono text-[#B87932] hover:underline cursor-pointer"
              >
                Reset search
              </button>
            </div>
          ) : (
            filteredCollectors.map((col) => {
              const isCurrent = currentDistrict && col.district.toLowerCase().includes(currentDistrict.toLowerCase());
              return (
                <div 
                  key={col.district}
                  className={`pt-3 first:pt-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl transition-all ${
                    isCurrent 
                      ? 'bg-amber-500/10 border border-[#B87932]/40 shadow-xs' 
                      : 'hover:bg-white/70'
                  }`}
                >
                  {/* Left: District & Collector Info */}
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isCurrent ? 'bg-[#B87932] text-white' : 'bg-[#17352A]/10 text-[#17352A]'
                    }`}>
                      <Building className="w-5 h-5" />
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-bold text-base text-[#17352A]">
                          {col.district}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-mono font-bold bg-[#B87932] text-white px-2 py-0.5 rounded-full uppercase">
                            Current Village District
                          </span>
                        )}
                        <span className="text-[10px] font-mono font-bold bg-[#17352A]/10 text-[#17352A] px-2 py-0.5 rounded-full uppercase">
                          IAS Cadre
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-semibold text-[#17352A]">
                          {col.name}
                        </span>
                        <span className="text-xs text-[#5F7668] font-mono">
                          • {col.designation}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Direct Actions (Call, Mail, Details) */}
                  <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
                    {col.phone ? (
                      <a
                        href={`tel:${col.phone.split(',')[0].trim()}`}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#17352A]/15 hover:border-[#B87932] hover:bg-[#F5F1E7] text-[#17352A] text-xs font-mono font-semibold transition-all shadow-2xs"
                        title={`Call Office: ${col.phone}`}
                      >
                        <Phone className="w-3.5 h-3.5 text-[#B87932]" />
                        <span>{col.phone}</span>
                      </a>
                    ) : (
                      <span className="text-[11px] font-mono text-[#5F7668]/60 italic px-2 py-1">
                        Phone: Via Collectorate
                      </span>
                    )}

                    {col.email ? (
                      <a
                        href={`mailto:${col.email}`}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#17352A] hover:bg-[#17352A]/90 text-white text-xs font-mono font-semibold transition-all shadow-2xs"
                        title={`Send Official Dispatch to ${col.email}`}
                      >
                        <Mail className="w-3.5 h-3.5 text-[#B87932]" />
                        <span className="hidden sm:inline">{col.email}</span>
                        <span className="sm:hidden">Email</span>
                      </a>
                    ) : (
                      <span className="text-[11px] font-mono text-[#5F7668]/60 italic px-2 py-1">
                        Email: Via Web Portal
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#17352A]/5 border-t border-[#17352A]/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-[#5F7668]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified Official Telangana State Web Directory • NIC/Panchayat Raj & Rural Development</span>
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 bg-[#17352A] text-white rounded-xl text-xs font-semibold hover:bg-[#17352A]/90 transition-all cursor-pointer"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
}
