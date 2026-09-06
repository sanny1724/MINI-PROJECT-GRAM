// src/components/GramMitraChat.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Bot, MessageSquare, X, Send, Sparkles, User, ArrowRight } from 'lucide-react';

export default function GramMitraChat({ data, lang, t, onOpenGrievanceForm }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: t.aiMitraGreeting
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update initial greeting on language change
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1) {
        return [{ sender: 'bot', text: t.aiMitraGreeting }];
      }
      return prev;
    });
  }, [lang, t.aiMitraGreeting]);

  const villageName = data?.villageInfo?.name || 'Jamsing Lingapur';
  const mandalName = data?.villageInfo?.mandalName || 'Ramayampet';
  const districtName = data?.villageInfo?.districtName || 'Medak';
  const devScore = data?.metrics?.developmentScore || 23;
  const sarpanchName = data?.officials?.[0]?.name || 'N. Raju Yadav';
  const budgetSpent = ((data?.budgets?.[0]?.totalSpent || 0) / 100000).toFixed(1);
  const budgetAlloc = ((data?.budgets?.[0]?.totalAllocation || 0) / 100000).toFixed(1);

  const handleSend = (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    // Generate grounded response based on live data
    setTimeout(() => {
      let botReply = '';
      const qLower = query.toLowerCase();

      if (qLower.includes('score') || qLower.includes('స్కోరు') || qLower.includes('development') || qLower.includes('అభివృద్ధి')) {
        botReply = lang === 'te'
          ? `${villageName} గ్రామ అభివృద్ధి సూచిక స్కోరు 100 కి గాను ${devScore}. ఇందులో తాగునీరు 15/100, ఆరోగ్యం 36/100 మరియు వ్యవసాయం 90/100 వద్ద ఉన్నాయి.`
          : `${villageName}'s overall Development Index is ${devScore}/100. Key sector breakdown: Agriculture 90/100, Health 36/100, and Water 15/100.`;
      } else if (qLower.includes('sarpanch') || qLower.includes('secretary') || qLower.includes('సర్పంచ్') || qLower.includes('కార్యదర్శి') || qLower.includes('officials') || qLower.includes('అధికారులు')) {
        botReply = lang === 'te'
          ? `మన గ్రామ సర్పంచ్ ${sarpanchName}. మీరు ఎడమవైపు ఉన్న అధికారుల డైరెక్టరీ ద్వారా వారిని నేరుగా ఫోన్‌లో సంప్రదించవచ్చు.`
          : `Our Gram Panchayat Sarpanch is ${sarpanchName}. You can call them directly via the Officials Directory on the dashboard.`;
      } else if (qLower.includes('budget') || qLower.includes('బడ్జెట్') || qLower.includes('road') || qLower.includes('ఖర్చు') || qLower.includes('scheme')) {
        botReply = lang === 'te'
          ? `ఈ ఆర్థిక సంవత్సరంలో కేటాయించిన మొత్తం ₹${budgetAlloc} లక్షల్లో ఇప్పటివరకు ₹${budgetSpent} లక్షలు ఖర్చు చేయడం జరిగింది.`
          : `For this fiscal year, ₹${budgetSpent} Lakhs has been utilized out of the total ₹${budgetAlloc} Lakhs allocated public budget.`;
      } else if (qLower.includes('complaint') || qLower.includes('grievance') || qLower.includes('ఫిర్యాదు') || qLower.includes('నీరు') || qLower.includes('water')) {
        botReply = lang === 'te'
          ? `తాగునీరు లేదా ఇతర సమస్యలపై ఫిర్యాదు చేయడానికి పైనున్న "+ ఫిర్యాదు చేయండి" బటన్ నొక్కండి. మీరు వాయిస్ రికార్డ్ ద్వారా కూడా ఫిర్యాదు చేయవచ్చు.`
          : `You can file a complaint right now by clicking "+ File Complaint" in the header. We support photo attachment and voice complaints with live tracking!`;
        if (onOpenGrievanceForm) {
          setTimeout(() => onOpenGrievanceForm(), 1200);
        }
      } else {
        botReply = lang === 'te'
          ? `${villageName} (${mandalName} మండలం, ${districtName} జిల్లా) కు సంబంధించిన వివరాల కోసం నేను సిద్ధంగా ఉన్నాను. దయచేసి నిర్దిష్ట ప్రశ్న అడగండి.`
          : `I am trained on official Telangana Panchayat Raj records for ${villageName}, ${mandalName} Mandal. You can ask about budgets, water supply, schools, or file a complaint.`;
      }

      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    }, 600);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[9990] bg-[#17352A] hover:bg-[#1f4738] text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2.5 border-2 border-[#B87932] transition-all duration-300 hover:scale-105 cursor-pointer group"
          title="Open Gram Mitra AI Copilot"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-[#B87932]" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <span className="font-heading font-bold text-xs pr-1 tracking-wide hidden sm:inline">
            {t.aiMitraTitle}
          </span>
        </button>
      )}

      {/* Chat Window Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[9995] w-[92vw] sm:w-96 bg-white rounded-3xl shadow-2xl border border-[#17352A]/20 flex flex-col overflow-hidden max-h-[80vh] h-[520px] animate-fade-in-up">
          
          {/* Header */}
          <div className="bg-[#17352A] text-white px-5 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#B87932] flex items-center justify-center text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm leading-tight text-white">
                  {t.aiMitraTitle}
                </h4>
                <span className="text-[10px] text-emerald-300 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Grounded on {villageName} Data
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto bg-[#F5F1E7]/50 flex flex-col gap-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-[#17352A] text-[#B87932] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    GM
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#B87932] text-white rounded-tr-xs font-medium'
                      : 'bg-white text-[#17352A] border border-[#17352A]/10 rounded-tl-xs shadow-2xs font-medium'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Prompt Chips */}
          <div className="px-3 pt-2 pb-1 bg-white border-t border-[#17352A]/10 flex flex-wrap gap-1.5">
            <button
              onClick={() => handleSend(t.aiPrompt1)}
              className="text-[10px] font-mono bg-[#F5F1E7] hover:bg-[#B87932]/10 border border-[#17352A]/10 px-2.5 py-1 rounded-lg text-[#17352A] transition-colors cursor-pointer truncate max-w-[170px]"
            >
              📊 {t.aiPrompt1}
            </button>
            <button
              onClick={() => handleSend(t.aiPrompt2)}
              className="text-[10px] font-mono bg-[#F5F1E7] hover:bg-[#B87932]/10 border border-[#17352A]/10 px-2.5 py-1 rounded-lg text-[#17352A] transition-colors cursor-pointer truncate max-w-[170px]"
            >
              🏛️ {t.aiPrompt2}
            </button>
            <button
              onClick={() => handleSend(t.aiPrompt3)}
              className="text-[10px] font-mono bg-[#F5F1E7] hover:bg-[#B87932]/10 border border-[#17352A]/10 px-2.5 py-1 rounded-lg text-[#17352A] transition-colors cursor-pointer truncate max-w-[170px]"
            >
              💰 {t.aiPrompt3}
            </button>
            <button
              onClick={() => handleSend(t.aiPrompt4)}
              className="text-[10px] font-mono bg-[#F5F1E7] hover:bg-[#B87932]/10 border border-[#17352A]/10 px-2.5 py-1 rounded-lg text-[#17352A] transition-colors cursor-pointer truncate max-w-[170px]"
            >
              ⚠️ {t.aiPrompt4}
            </button>
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-[#17352A]/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.askPlaceholder}
              className="flex-1 bg-[#F5F1E7] border border-[#17352A]/15 focus:border-[#B87932] px-3.5 py-2 rounded-xl text-xs text-[#17352A] outline-none"
            />
            <button
              type="submit"
              className="bg-[#B87932] hover:bg-[#B87932]/90 text-white p-2 rounded-xl transition-all cursor-pointer shrink-0"
              title={t.send}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
