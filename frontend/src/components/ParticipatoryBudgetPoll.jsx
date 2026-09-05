// src/components/ParticipatoryBudgetPoll.jsx
import React, { useState } from 'react';
import { Vote, CheckCircle, Zap, Activity, Droplets, Users, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ParticipatoryBudgetPoll({ t, lang }) {
  // Load existing vote from localStorage
  const [userVote, setUserVote] = useState(() => {
    try {
      return localStorage.getItem('gram_participatory_poll_vote') || null;
    } catch(e) {
      return null;
    }
  });

  const [proposals, setProposals] = useState([
    {
      id: 'prop-1',
      title: t.proposal1Title,
      cost: t.proposal1Cost,
      icon: Zap,
      votes: 38,
      color: 'bg-amber-500'
    },
    {
      id: 'prop-2',
      title: t.proposal2Title,
      cost: t.proposal2Cost,
      icon: Activity,
      votes: 52,
      color: 'bg-rose-500'
    },
    {
      id: 'prop-3',
      title: t.proposal3Title,
      cost: t.proposal3Cost,
      icon: Droplets,
      votes: 45,
      color: 'bg-blue-500'
    },
  ]);

  const totalVotes = proposals.reduce((acc, p) => acc + p.votes, 0);

  const handleVote = (proposalId) => {
    if (userVote) {
      toast.info(t.oneVoteNotice);
      return;
    }

    setProposals(prev => prev.map(p => {
      if (p.id === proposalId) {
        return { ...p, votes: p.votes + 1 };
      }
      return p;
    }));

    setUserVote(proposalId);
    try {
      localStorage.setItem('gram_participatory_poll_vote', proposalId);
    } catch(e) {}

    toast.success(lang === 'te' ? 'మీ ఓటు విజయవంతంగా నమోదైంది!' : 'Your citizen vote has been recorded!');
  };

  return (
    <div className="bg-white border border-[#17352A]/10 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#17352A]/10 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-[#B87932] uppercase tracking-wider">
            {t.participatorySubtitle}
          </span>
          <h3 className="font-heading font-bold text-xl text-[#17352A] mt-0.5 flex items-center gap-2">
            <Vote className="w-5 h-5 text-[#B87932]" />
            {t.participatoryTitle}
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-[#F5F1E7] border border-[#17352A]/10 px-3 py-1.5 rounded-xl font-bold">
          <Users className="w-4 h-4 text-[#B87932]" />
          <span>{t.totalVotesCast}: {totalVotes}</span>
        </div>
      </div>

      {/* Proposals List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {proposals.map(prop => {
          const IconComp = prop.icon;
          const percentage = totalVotes > 0 ? Math.round((prop.votes / totalVotes) * 100) : 0;
          const isSelected = userVote === prop.id;

          return (
            <div
              key={prop.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                isSelected 
                  ? 'bg-amber-500/10 border-[#B87932] ring-2 ring-[#B87932]/30' 
                  : 'bg-[#F5F1E7] border-[#17352A]/10 hover:border-[#B87932]/40'
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#17352A]/10 flex items-center justify-center shadow-2xs">
                    <IconComp className="w-5 h-5 text-[#B87932]" />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#B87932]">
                    {percentage}%
                  </span>
                </div>

                <h4 className="font-heading font-bold text-sm text-[#17352A] leading-snug">
                  {prop.title}
                </h4>
                <span className="text-[10px] font-mono text-[#5F7668]">
                  {prop.cost}
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {/* Progress bar */}
                <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-[#17352A]/5">
                  <div 
                    className={`h-full ${prop.color} transition-all duration-700 rounded-full`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Vote Action */}
                <button
                  onClick={() => handleVote(prop.id)}
                  disabled={userVote !== null}
                  className={`w-full py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : userVote !== null
                      ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                      : 'bg-[#B87932] hover:bg-[#B87932]/90 text-white shadow-xs hover:scale-[1.02]'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{t.voted}</span>
                    </>
                  ) : (
                    <span>{t.voteNow} ({prop.votes})</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[10px] font-mono text-[#5F7668] text-center flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>{t.oneVoteNotice}</span>
      </div>

    </div>
  );
}
