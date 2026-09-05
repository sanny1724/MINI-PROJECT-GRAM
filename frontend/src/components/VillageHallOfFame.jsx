// src/components/VillageHallOfFame.jsx
import React, { useState } from 'react';
import { Trophy, CheckCircle2, Heart, Award, Sparkles, UserCheck } from 'lucide-react';
import { toast } from 'react-toastify';

export default function VillageHallOfFame({ t, lang }) {
  const [appreciations, setAppreciations] = useState({
    'champ-1': 48,
    'champ-2': 36,
    'champ-3': 64
  });

  const [appreciatedMap, setAppreciatedMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gram_hall_of_fame_hearts') || '{}');
    } catch(e) {
      return {};
    }
  });

  const handleAppreciate = (champId) => {
    if (appreciatedMap[champId]) {
      toast.info(lang === 'te' ? 'మీరు ఇప్పటికే అభినందించారు!' : 'You have already appreciated this champion!');
      return;
    }

    setAppreciations(prev => ({
      ...prev,
      [champId]: (prev[champId] || 0) + 1
    }));

    setAppreciatedMap(prev => {
      const updated = { ...prev, [champId]: true };
      try { localStorage.setItem('gram_hall_of_fame_hearts', JSON.stringify(updated)); } catch(e){}
      return updated;
    });

    toast.success(lang === 'te' ? 'మీ ప్రశంస నమోదు చేయబడింది! ❤️' : 'Appreciation recorded for our village champion! ❤️');
  };

  const milestones = [
    t.milestone1,
    t.milestone2,
    t.milestone3
  ];

  const champions = [
    {
      id: 'champ-1',
      name: t.champion1Name,
      role: t.champion1Role,
      praise: t.champion1Praise,
      icon: '🩺'
    },
    {
      id: 'champ-2',
      name: t.champion2Name,
      role: t.champion2Role,
      praise: t.champion2Praise,
      icon: '📚'
    },
    {
      id: 'champ-3',
      name: t.champion3Name,
      role: t.champion3Role,
      praise: t.champion3Praise,
      icon: '🚰'
    },
  ];

  return (
    <div className="bg-white border border-[#17352A]/10 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#17352A]/10 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-[#B87932] uppercase tracking-wider">
            {t.hallOfFameSubtitle}
          </span>
          <h3 className="font-heading font-bold text-xl text-[#17352A] mt-0.5 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#B87932]" />
            {t.hallOfFameTitle}
          </h3>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold bg-amber-500/10 text-[#B87932] border border-[#B87932]/25">
          <Award className="w-3.5 h-3.5" /> Gram Sabha Certified
        </span>
      </div>

      {/* Verified Milestones Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {milestones.map((m, idx) => (
          <div key={idx} className="bg-[#F5F1E7] border border-[#17352A]/10 p-3.5 rounded-2xl flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="text-xs font-medium text-[#17352A] leading-snug">{m}</span>
          </div>
        ))}
      </div>

      {/* Frontline Champions Spotlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-1">
        {champions.map(champ => {
          const isLoved = !!appreciatedMap[champ.id];
          const count = appreciations[champ.id] || 0;

          return (
            <div key={champ.id} className="bg-[#F5F1E7] border border-[#17352A]/10 p-5 rounded-2xl flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{champ.icon}</span>
                  <button
                    onClick={() => handleAppreciate(champ.id)}
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                      isLoved
                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                        : 'bg-white border-[#17352A]/15 text-[#17352A] hover:border-rose-300 hover:text-rose-600'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLoved ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
                    <span>{count}</span>
                  </button>
                </div>

                <div>
                  <h4 className="font-heading font-bold text-sm text-[#17352A]">{champ.name}</h4>
                  <span className="text-[10px] font-mono text-[#B87932] font-bold uppercase">{champ.role}</span>
                </div>

                <p className="text-xs text-[#5F7668] leading-snug font-medium">
                  {champ.praise}
                </p>
              </div>

              <button
                onClick={() => handleAppreciate(champ.id)}
                className={`w-full py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  isLoved
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-white border border-[#17352A]/10 hover:border-[#B87932] text-[#17352A]'
                }`}
              >
                {isLoved ? t.appreciatedBtn : t.appreciateBtn}
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
