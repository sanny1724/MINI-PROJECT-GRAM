import GovtHeaderRibbon from '../components/GovtHeaderRibbon';
// src/pages/PublicDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Building, Users, Calendar, Activity, 
  TrendingUp, TrendingDown, RefreshCw, Droplet, GraduationCap, 
  Sprout, FileText, ShieldAlert, DollarSign, FileText as Scroll, 
  Phone, Plus, CheckCircle, AlertTriangle, AlertCircle, Clock, 
  Paperclip, Globe, Mic, MicOff, ThumbsUp, Star, ShieldCheck, 
  MessageSquare, ExternalLink, Printer, CheckCircle2, Award, 
  Sparkles, Vote, Trophy
} from 'lucide-react';
import api from '../api';
import { toast } from 'react-toastify';
import { translations } from '../utils/translations';
import OfficialAuditDossierModal from '../components/OfficialAuditDossierModal';
import VillageGISMap from '../components/VillageGISMap';
import EmergencyAlertBanner from '../components/EmergencyAlertBanner';
import VillageComparisonModal from '../components/VillageComparisonModal';
import ParticipatoryBudgetPoll from '../components/ParticipatoryBudgetPoll';
import AIPredictiveSimulator from '../components/AIPredictiveSimulator';
import VillageHallOfFame from '../components/VillageHallOfFame';
import GramMitraChat from '../components/GramMitraChat';

export default function PublicDashboard() {
  const { villageCode } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  // 1. Language state (English / Telugu)
  const [lang, setLang] = useState('en');
  const t = translations[lang];

  // Tab for active domain details
  const [activeDomain, setActiveDomain] = useState('Water');

  // Grievance filing modal/form states
  const [showGrievanceForm, setShowGrievanceForm] = useState(false);
  const [grievanceForm, setGrievanceForm] = useState({
    title: '',
    category: 'Water',
    description: '',
    phone: '',
    enableWhatsApp: true
  });
  
  // File upload state variables
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Expanded tracking timeline
  const [expandedGrievanceId, setExpandedGrievanceId] = useState(null);

  // Official Audit Dossier Modal
  const [showDossierModal, setShowDossierModal] = useState(false);

  // Mandal Benchmark Comparison Modal
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Community Upvoting state map with 1-endorsement-per-citizen enforcement
  const [upvotesMap, setUpvotesMap] = useState({
    'TS-GRM-MED-2026-819230': 7,
    '1': 12,
    '2': 4
  });

  // Track which grievances this user has personally endorsed
  const [userEndorsedMap, setUserEndorsedMap] = useState(() => {
    try {
      const saved = localStorage.getItem('gram_user_endorsed_cases');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Citizen Satisfaction Ratings & Verified Fixed map
  const [ratingsMap, setRatingsMap] = useState({});
  const [verifiedMap, setVerifiedMap] = useState({});

  // WhatsApp live notification toast
  const [activeWhatsAppToast, setActiveWhatsAppToast] = useState(null);

  // Background real-time simulator for newly filed cases
  useEffect(() => {
    const activeSubmissions = data?.grievances?.filter(
      g => typeof g.id === 'string' && g.id.startsWith('TS-GRM-') && g.status !== 'Resolved'
    );

    if (activeSubmissions && activeSubmissions.length > 0) {
      const timer = setTimeout(() => {
        setData(prev => {
          if (!prev) return prev;
          const updatedGrievances = prev.grievances.map(g => {
            if (typeof g.id === 'string' && g.id.startsWith('TS-GRM-')) {
              const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              if (g.status === 'Submitted') {
                triggerWhatsAppAlert(g.id, 'Assigned', `Dispatched to Mandal Officer (${prev.villageInfo?.mandalName || 'Mandal'} Office)`);
                return {
                  ...g,
                  status: 'Assigned',
                  timeline: [
                    ...g.timeline,
                    { status: 'Assigned', time: timeStr, detail: `Dispatched to Mandal Officer (${prev.villageInfo?.mandalName || 'Mandal'} Office)` }
                  ]
                };
              } else if (g.status === 'Assigned') {
                triggerWhatsAppAlert(g.id, 'Investigating', `Panchayat Secretary initiated field inspection`);
                return {
                  ...g,
                  status: 'Investigating',
                  timeline: [
                    ...g.timeline,
                    { status: 'Investigating', time: timeStr, detail: `Panchayat Secretary (${prev.officials?.[0]?.name || 'Sarpanch'}) initiated on-site inspection.` }
                  ]
                };
              } else if (g.status === 'Investigating') {
                toast.success(`Case RESOLVED: ${g.id} has been addressed!`);
                triggerWhatsAppAlert(g.id, 'Resolved', 'Corrective action deployed and verified on site.');
                return {
                  ...g,
                  status: 'Resolved',
                  timeline: [
                    ...g.timeline,
                    { status: 'Resolved', time: timeStr, detail: 'Resolution approved. Corrective action deployed and verified on site.' }
                  ]
                };
              }
            }
            return g;
          });
          return { ...prev, grievances: updatedGrievances };
        });
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [data?.grievances]);

  // Voice recording timer & simulated speech recognition
  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleVoiceToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      // Auto transcribe speech
      const sampleTelugu = "మా గ్రామంలోని ప్రధాన వీధిలో మిషన్ భగీరథ తాగునీటి పైప్‌లైన్ పగిలిపోయింది. తక్షణమే మరమ్మతులు చేపట్టవలసిందిగా కోరుతున్నాము.";
      const sampleEnglish = "The drinking water supply pipeline near the primary school is fractured and leaking continuously. Please dispatch the maintenance engineer for urgent repair.";
      const transcribed = lang === 'te' ? sampleTelugu : sampleEnglish;
      
      setGrievanceForm(prev => ({
        ...prev,
        description: prev.description ? `${prev.description} ${transcribed}` : transcribed
      }));
      toast.info(lang === 'te' ? 'వాయిస్ రికార్డింగ్ విజయవంతంగా నమోదు చేయబడింది!' : 'Voice complaint successfully transcribed!');
    } else {
      setIsRecording(true);
      toast.info(t.voiceRecording);
    }
  };

  const triggerWhatsAppAlert = (caseId, status, detail) => {
    setActiveWhatsAppToast({
      caseId,
      status,
      detail,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    setTimeout(() => {
      setActiveWhatsAppToast(null);
    }, 6000);
  };

  // Upvoting action - Enforcing strict 1-endorsement-per-citizen constraint
  const handleUpvote = (grievanceId) => {
    const isAlreadyEndorsed = !!userEndorsedMap[grievanceId];
    
    // Clear any active toasts to avoid clutter
    toast.dismiss();

    if (isAlreadyEndorsed) {
      // Toggle off / Withdraw endorsement
      setUserEndorsedMap(prev => {
        const updated = { ...prev, [grievanceId]: false };
        try { localStorage.setItem('gram_user_endorsed_cases', JSON.stringify(updated)); } catch(e){}
        return updated;
      });
      setUpvotesMap(prev => {
        const current = prev[grievanceId] || 0;
        const next = Math.max(0, current - 1);
        return { ...prev, [grievanceId]: next };
      });
      toast.info(
        lang === 'te' ? 'మీ మద్దతు ఉపసంహరించబడింది' : 'Endorsement withdrawn',
        { toastId: `upvote-${grievanceId}`, autoClose: 2500 }
      );
    } else {
      // Record single endorsement
      setUserEndorsedMap(prev => {
        const updated = { ...prev, [grievanceId]: true };
        try { localStorage.setItem('gram_user_endorsed_cases', JSON.stringify(updated)); } catch(e){}
        return updated;
      });
      setUpvotesMap(prev => {
        const current = prev[grievanceId] || 0;
        const next = current + 1;
        return { ...prev, [grievanceId]: next };
      });
      toast.success(
        lang === 'te' ? 'మీ మద్దతు నమోదు చేయబడింది! (ఒక్క పౌరునికి ఒకటే)' : 'Endorsed! (1 endorsement per citizen recorded)',
        { toastId: `upvote-${grievanceId}`, autoClose: 2500 }
      );
    }
  };

  // Fetch village dashboard details
  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/villages/${villageCode}/dashboard`);
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

    const distName = data?.villageInfo?.districtName || 'TG';
    const distCode = distName.substring(0, 3).toUpperCase();
    const caseNum = `TS-GRM-${distCode}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newGrievance = {
      id: caseNum,
      title: grievanceForm.title,
      category: grievanceForm.category,
      status: 'Submitted',
      createdAt: new Date().toISOString(),
      description: grievanceForm.description,
      attachment: selectedFileName || null,
      phone: grievanceForm.phone,
      timeline: [
        { status: 'Submitted', time: timeStr, detail: 'Grievance registered by citizen via LGD Public portal.' }
      ]
    };

    setData(prev => ({
      ...prev,
      grievances: [newGrievance, ...(prev?.grievances || [])]
    }));

    if (grievanceForm.enableWhatsApp && grievanceForm.phone) {
      triggerWhatsAppAlert(caseNum, 'Submitted', 'Grievance filed! Live tracking updates enabled for your mobile.');
    }

    toast.success(`Grievance filed! Registered Case Number: ${caseNum}`);
    setShowGrievanceForm(false);
    setGrievanceForm({ title: '', category: 'Water', description: '', phone: '', enableWhatsApp: true });
    setSelectedFileName('');
    setSelectedFile(null);
    setExpandedGrievanceId(caseNum); // Auto-expand live timeline
  };

    if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#F5F1E7] text-[#17352A] p-6 text-center select-none">
        <div className="relative mb-5 flex items-center justify-center">
          <div className="absolute inset-0 -m-3 rounded-full border-2 border-dashed border-[#B87932]/40 animate-[spin_12s_linear_infinite]" />
          <div className="w-24 h-24 rounded-full bg-white shadow-xl p-2 border border-[#17352A]/10 flex items-center justify-center">
            <img src="/telangana-seal.png" alt="Government of Telangana Seal" className="w-full h-full object-contain animate-pulse" />
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold tracking-widest text-[#B87932] uppercase mb-1">
          Government of Telangana • తెలంగాణ ప్రభుత్వం
        </span>
        <h3 className="font-heading font-bold text-xl text-[#17352A] mb-3">
          Loading Village LGD Dashboard...
        </h3>
        <div className="w-44 h-1.5 bg-[#17352A]/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#B87932] to-[#2A7B72] animate-[pulse_1.2s_ease-in-out_infinite]" style={{ width: '100%' }} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#F5F1E7] text-[#17352A] px-6 text-center">
        <AlertTriangle className="w-16 h-16 text-[#B87932] mb-6" />
        <h2 className="font-heading text-3xl font-bold text-[#17352A] mb-2">Error Loading Dashboard</h2>
        <p className="text-sm text-[#5F7668] max-w-sm mb-6">{error || 'Village not found'}</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-[#B87932] hover:bg-[#B87932]/90 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home Map
        </button>
      </div>
    );
  }

  const { villageInfo, metrics, officials, schemes, budgets, grievances } = data;
  const budget = budgets?.[0] || { totalAllocation: 0, totalSpent: 0, infrastructureAlloc: 0, welfareAlloc: 0, year: '2025-26' };
  const spentPercent = budget.totalAllocation > 0 ? Math.round((budget.totalSpent / budget.totalAllocation) * 100) : 0;

  // Domain descriptions for dynamic details tab
  const domainDetailsMap = {
    Water: {
      score: metrics.waterScore,
      risk: metrics.waterRisk,
      trend: metrics.waterTrend,
      desc: lang === 'te'
        ? 'రక్షిత తాగునీటి సరఫరా, మిషన్ భగీరథ కనెక్షన్లు, బోరుబావుల పనితీరు మరియు క్లోరినేషన్ శుద్ధి వివరాలు.'
        : 'Monitors the status of clean drinking water supply pipelines, borewell function ratings, overhead water tank storage capacity, and water filtration assets.',
      indicators: [
        { label: lang === 'te' ? 'మిషన్ భగీరథ కనెక్షన్ రేటు' : 'Mission Bhagiratha Connection Rate', val: '98%' },
        { label: lang === 'te' ? 'బోరుబావుల పనితీరు సూచిక' : 'Borewell Functionality Index', val: '92/100' },
        { label: lang === 'te' ? 'ఫ్లోరైడ్ రహిత నీటి నాణ్యత' : 'Fluoride Concentration Level', val: '0.2 ppm (Safe)' },
        { label: lang === 'te' ? 'రోజువారీ నీటి సరఫరా సమయం' : 'Average Daily Supply Duration', val: '2.5 Hours' }
      ]
    },
    Education: {
      score: metrics.educationScore,
      risk: metrics.educationRisk,
      trend: metrics.educationTrend,
      desc: lang === 'te'
        ? 'ప్రాథమిక మరియు ఉన్నత పాఠశాలల వసతులు, డిజిటల్ తరగతి గదులు, ఉపాధ్యాయ-విద్యార్థి నిష్పత్తి మరియు మధ్యాహ్న భోజన పథకం వివరాలు.'
        : 'Tracks primary and secondary government school infrastructure, classroom capacities, student-to-teacher ratios, and midday meal program consistency.',
      indicators: [
        { label: lang === 'te' ? 'ఉపాధ్యాయ-విద్యార్థి నిష్పత్తి' : 'Student-Teacher Ratio', val: '24:1' },
        { label: lang === 'te' ? 'తరగతి గదుల మౌలిక వసతులు' : 'Classroom Infrastructure Index', val: '86/100' },
        { label: lang === 'te' ? 'బాలికల ప్రత్యేక శౌచాలయాలు' : 'Separate Toilet Sanitation', val: '100% Functional' },
        { label: lang === 'te' ? 'మధ్యాహ్న భోజన ఆడిట్ పాస్' : 'Midday Meal Quality Audit Pass', val: 'Yes' }
      ]
    },
    Health: {
      score: metrics.healthScore,
      risk: metrics.healthRisk,
      trend: metrics.healthTrend,
      desc: lang === 'te'
        ? 'ప్రాథమిక ఆరోగ్య ఉప-కేంద్రం సేవలు, అత్యవసర మందుల లభ్యత, చిన్నారుల టీకాలు మరియు వైద్య సిబ్బంది హాజరు రికార్డులు.'
        : 'Tracks local Primary Health Centre (PHC) operations, availability of essential medicine stocks, neonatal vaccines, and doctor/nurse attendance registers.',
      indicators: [
        { label: lang === 'te' ? 'మందుల నిల్వల సమృద్ధి' : 'Medicine Stock Sufficiency', val: '94%' },
        { label: lang === 'te' ? 'వైద్య సిబ్బంది హాజరు శాతం' : 'Staff Attendance Registry', val: '96.5%' },
        { label: lang === 'te' ? 'చిన్నారుల టీకాల కవరేజ్' : 'Polio/Vaccine Stock Level', val: '100% Sufficient' },
        { label: lang === 'te' ? 'సగటు వేచి ఉండే సమయం' : 'Average PHC Wait Time', val: '12 Minutes' }
      ]
    },
    Agriculture: {
      score: metrics.agricultureScore,
      risk: metrics.agricultureRisk,
      trend: metrics.agricultureTrend,
      desc: lang === 'te'
        ? 'రైతు బంధు/రైతు భరోసా పెట్టుబడి సాయం జమ, భూసార పరీక్షల ఫలితాలు, పంటల బీమా నమోదు మరియు మార్కెట్ లావాదేవీలు.'
        : 'Audits Rythu Bandhu farmer investment deposits, soil testing clinic accessibility, crop insurance enrollments, and local market yard transactions.',
      indicators: [
        { label: lang === 'te' ? 'రైతు బంధు జమ శాతం' : 'Rythu Bandhu Transfer Completion', val: '100%' },
        { label: lang === 'te' ? 'భూసార పరీక్ష పత్రాల పంపిణీ' : 'Soil Testing Reports Distributed', val: '450 Farms' },
        { label: lang === 'te' ? 'పంట బీమా నమోదు రైతులు' : 'Crop Insurance Enrolled Farmers', val: '89%' },
        { label: lang === 'te' ? 'సగటు భూగర్భ జల మట్టం' : 'Average Borewell Ground Level', val: '120 meters' }
      ]
    },
    Governance: {
      score: metrics.governanceScore,
      risk: metrics.governanceRisk,
      trend: metrics.governanceTrend,
      desc: lang === 'te'
        ? 'గ్రామ పంచాయతీ పారదర్శకత, బడ్జెట్ వివరాలు, ప్రజా సమస్యల పరిష్కార వేగం మరియు గ్రామ సభల నిర్వహణ రికార్డులు.'
        : 'Measures panchayat administrative speed, budget disclosure score, resolution rates of citizen grievances, and local meeting registers.',
      indicators: [
        { label: lang === 'te' ? 'సమస్యల సగటు పరిష్కార వేగం' : 'Grievance Resolution Speed', val: '4.2 Days Avg' },
        { label: lang === 'te' ? 'బడ్జెట్ పారదర్శకతా సూచిక' : 'Panchayat Budget Transparency Index', val: '95/100' },
        { label: lang === 'te' ? 'గడచిన సంవత్సరంలో గ్రామ సభలు' : 'Gram Sabha Meetings Held (Past Year)', val: '6 Sessions' },
        { label: lang === 'te' ? 'పరిపాలనా ఆడిట్ స్థితి' : 'Administrative Registry Audit', val: 'Pass' }
      ]
    }
  };

  const currentDomain = domainDetailsMap[activeDomain];

  return (
    <div className="min-h-screen bg-[#F5F1E7] text-[#17352A] font-sans selection:bg-[#B87932] selection:text-white pb-24">
      
      {/* Official Government Utility Ribbon */}
      <GovtHeaderRibbon lang={lang} onToggleLang={() => setLang(prev => prev === 'en' ? 'te' : 'en')} />

      {/* Feature 4: Emergency Disaster Advisory Banner */}
      <EmergencyAlertBanner t={t} lang={lang} />

      {/* Top Sticky Header */}
      <header className="bg-[#F5F1E7]/95 border-b border-[#17352A]/10 py-5 px-6 sticky top-0 backdrop-blur-md z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          {/* Back button, Village Title and Badges */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="w-10 h-10 border border-[#17352A]/15 hover:border-[#B87932] bg-white rounded-xl flex items-center justify-center text-[#17352A] hover:text-[#B87932] transition-all shadow-xs cursor-pointer"
              title="Back to Landing Page"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-[#17352A] tracking-tight">
                  {villageInfo.name}
                </h1>
                <span className="text-[10px] font-mono font-bold tracking-wider bg-[#B87932]/10 text-[#B87932] border border-[#B87932]/25 px-2.5 py-0.5 rounded-full uppercase shrink-0">
                  {t.publicDashboard}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[#5F7668] mt-1.5 font-medium">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#B87932]" /> {t.mandal}: {villageInfo.mandalName}</span>
                <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5 text-[#B87932]" /> {t.district}: {villageInfo.districtName}</span>
                <span className="font-mono text-[#17352A] font-semibold">{t.lgdCode}: {villageInfo.code}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-300/70 px-2.5 py-0.5 rounded-full font-bold shadow-2xs">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  NIC/LGD Telemetry Sync: Live
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#17352A]/80 bg-white border border-[#17352A]/15 px-2.5 py-0.5 rounded-full font-medium shadow-2xs">
                  Hash: #TS-{villageInfo.code || '572932'}-2026
                </span>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto justify-between md:justify-end">
            
            {/* Feature 2: Mandal Rankings & Benchmark Button */}
            <button
              onClick={() => setShowComparisonModal(true)}
              className="bg-white border border-[#17352A]/15 hover:border-[#B87932] text-[#17352A] px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:bg-[#F5F1E7]"
              title="Compare with neighboring villages in Mandal"
            >
              <Award className="w-3.5 h-3.5 text-[#B87932]" />
              <span className="hidden sm:inline">{t.benchmarkBtn}</span>
            </button>

            {/* Feature 1: Bilingual Language Switcher */}
            <button
              onClick={() => setLang(prev => prev === 'en' ? 'te' : 'en')}
              className="bg-white border border-[#17352A]/15 hover:border-[#B87932] text-[#17352A] px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:bg-[#F5F1E7]"
              title="Switch Language (ఇంగ్లీష్ / తెలుగు)"
            >
              <Globe className="w-3.5 h-3.5 text-[#B87932]" />
              <span>{lang === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>

            {/* Feature 3: Official Dossier Download Button */}
            <button
              onClick={() => setShowDossierModal(true)}
              className="bg-white border border-[#17352A]/15 hover:border-[#B87932] text-[#17352A] px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:bg-[#F5F1E7]"
              title="Download Print-Ready Official Village Dossier with QR Code"
            >
              <Printer className="w-3.5 h-3.5 text-[#B87932]" />
              <span className="hidden sm:inline">{t.downloadDossier}</span>
            </button>

            {/* File Complaint Primary Button */}
            <button
              onClick={() => setShowGrievanceForm(true)}
              className="bg-[#B87932] hover:bg-[#B87932]/90 text-white font-bold text-xs font-mono px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" /> {t.fileComplaint}
            </button>
          </div>

        </div>
      </header>

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN - Development Index Radial & Officials Directory (4 cols) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          
          {/* radial Development Score Card */}
          <div className="gov-card rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <span className="text-xs font-mono font-bold text-[#B87932] tracking-widest uppercase mb-4">{t.developmentIndex}</span>
            
            {/* Circular Gauge */}
            <div className="relative w-40 h-40 flex items-center justify-center mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="rgba(23,53,42,0.06)"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#B87932"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * metrics.developmentScore) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-heading font-black text-[#17352A] font-mono-num leading-none">{metrics.developmentScore}</span>
                <span className="text-[10px] text-[#5F7668] uppercase tracking-wider font-semibold mt-1">{t.score}</span>
              </div>
            </div>

            {/* Risk banner */}
            <div className={`w-full border px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider mb-4 flex items-center justify-center gap-2 ${
              metrics.riskLevel === 'LOW' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
              metrics.riskLevel === 'MEDIUM' ? 'bg-amber-50 border-amber-200 text-amber-800' :
              'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                metrics.riskLevel === 'LOW' ? 'bg-emerald-600 animate-pulse' :
                metrics.riskLevel === 'MEDIUM' ? 'bg-amber-600 animate-pulse' :
                'bg-rose-600 animate-ping'
              }`} />
              {t.aiRiskRating}: {metrics.riskLevel}
            </div>

            <p className="text-xs text-[#5F7668] leading-relaxed font-medium">
              {t.developmentDesc}
            </p>
          </div>

          {/* Local Officials Directory */}
          <div className="gov-card-static rounded-3xl p-6 flex flex-col gap-4">
            <h3 className="font-heading font-bold text-lg text-[#17352A] border-b border-[#17352A]/10 pb-3">{t.officialsDirectory}</h3>
            <div className="flex flex-col gap-4">
              {officials.map(o => (
                <div key={o.id} className="flex items-center justify-between border-b border-[#17352A]/5 last:border-b-0 pb-3 last:pb-0">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#17352A]">{o.name}</span>
                    <span className="text-[10px] text-[#B87932] font-mono uppercase tracking-wider font-bold">{o.designation}</span>
                  </div>
                  <a 
                    href={`tel:${o.contact}`} 
                    className="w-9 h-9 bg-[#F5F1E7] hover:bg-[#B87932]/10 border border-[#17352A]/10 hover:border-[#B87932] rounded-lg flex items-center justify-center text-[#B87932] transition-colors"
                    title={`Call ${o.name}`}
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* RIGHT COLUMN - Metrics details, GIS Map, Budgets, Polls, Simulator, Hall of Fame, Grievances (8 cols) */}
        <section className="lg:col-span-8 flex flex-col gap-8">
          
          {/* 5 Domain Grid Cards */}
          <div>
            <h3 className="text-xs font-mono font-bold text-[#B87932] tracking-widest uppercase mb-4">{t.domainMetrics}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              
              <button 
                onClick={() => setActiveDomain('Water')}
                className={`p-4 rounded-2xl flex flex-col items-center text-center border transition-all cursor-pointer ${
                  activeDomain === 'Water' 
                    ? 'bg-white border-[#B87932] shadow-sm ring-1 ring-[#B87932]/40' 
                    : 'bg-white/70 hover:bg-white border-[#17352A]/10 hover:border-[#B87932]/30'
                }`}
              >
                <Droplet className={`w-6 h-6 mb-2 ${activeDomain === 'Water' ? 'text-[#B87932]' : 'text-blue-600'}`} />
                <span className="text-[10px] font-mono uppercase font-bold text-[#5F7668]">{t.water}</span>
                <span className="font-heading font-black text-xl text-[#17352A] mt-1">{metrics.waterScore}</span>
              </button>

              <button 
                onClick={() => setActiveDomain('Education')}
                className={`p-4 rounded-2xl flex flex-col items-center text-center border transition-all cursor-pointer ${
                  activeDomain === 'Education' 
                    ? 'bg-white border-[#B87932] shadow-sm ring-1 ring-[#B87932]/40' 
                    : 'bg-white/70 hover:bg-white border-[#17352A]/10 hover:border-[#B87932]/30'
                }`}
              >
                <GraduationCap className={`w-6 h-6 mb-2 ${activeDomain === 'Education' ? 'text-[#B87932]' : 'text-indigo-600'}`} />
                <span className="text-[10px] font-mono uppercase font-bold text-[#5F7668]">{t.education}</span>
                <span className="font-heading font-black text-xl text-[#17352A] mt-1">{metrics.educationScore}</span>
              </button>

              <button 
                onClick={() => setActiveDomain('Health')}
                className={`p-4 rounded-2xl flex flex-col items-center text-center border transition-all cursor-pointer ${
                  activeDomain === 'Health' 
                    ? 'bg-white border-[#B87932] shadow-sm ring-1 ring-[#B87932]/40' 
                    : 'bg-white/70 hover:bg-white border-[#17352A]/10 hover:border-[#B87932]/30'
                }`}
              >
                <Activity className={`w-6 h-6 mb-2 ${activeDomain === 'Health' ? 'text-[#B87932]' : 'text-rose-600'}`} />
                <span className="text-[10px] font-mono uppercase font-bold text-[#5F7668]">{t.health}</span>
                <span className="font-heading font-black text-xl text-[#17352A] mt-1">{metrics.healthScore}</span>
              </button>

              <button 
                onClick={() => setActiveDomain('Agriculture')}
                className={`p-4 rounded-2xl flex flex-col items-center text-center border transition-all cursor-pointer ${
                  activeDomain === 'Agriculture' 
                    ? 'bg-white border-[#B87932] shadow-sm ring-1 ring-[#B87932]/40' 
                    : 'bg-white/70 hover:bg-white border-[#17352A]/10 hover:border-[#B87932]/30'
                }`}
              >
                <Sprout className={`w-6 h-6 mb-2 ${activeDomain === 'Agriculture' ? 'text-[#B87932]' : 'text-emerald-600'}`} />
                <span className="text-[10px] font-mono uppercase font-bold text-[#5F7668]">{t.agriculture}</span>
                <span className="font-heading font-black text-xl text-[#17352A] mt-1">{metrics.agricultureScore}</span>
              </button>

              <button 
                onClick={() => setActiveDomain('Governance')}
                className={`p-4 rounded-2xl flex flex-col items-center text-center border transition-all col-span-2 sm:col-span-1 cursor-pointer ${
                  activeDomain === 'Governance' 
                    ? 'bg-white border-[#B87932] shadow-sm ring-1 ring-[#B87932]/40' 
                    : 'bg-white/70 hover:bg-white border-[#17352A]/10 hover:border-[#B87932]/30'
                }`}
              >
                <ShieldAlert className={`w-6 h-6 mb-2 ${activeDomain === 'Governance' ? 'text-[#B87932]' : 'text-amber-600'}`} />
                <span className="text-[10px] font-mono uppercase font-bold text-[#5F7668]">{t.governance}</span>
                <span className="font-heading font-black text-xl text-[#17352A] mt-1">{metrics.governanceScore}</span>
              </button>

            </div>
          </div>

          {/* Domain Detail Pane */}
          <div className="gov-card-static rounded-3xl p-6 flex flex-col gap-6">
            <div className="flex justify-between items-start border-b border-[#17352A]/10 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#B87932] uppercase">{t.sectorFocus}</span>
                <h4 className="font-heading font-bold text-xl text-[#17352A] mt-1">{activeDomain} {t.details}</h4>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono font-bold uppercase border px-3 py-1 rounded-lg ${
                  currentDomain.risk === 'LOW' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                  currentDomain.risk === 'MEDIUM' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                  'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {currentDomain.risk} {t.risk}
                </span>
                <span className="text-xs bg-[#F5F1E7] border border-[#17352A]/10 px-2.5 py-1 rounded-lg font-mono flex items-center gap-1.5 text-[#17352A]">
                  {t.trend}: 
                  {currentDomain.trend === 'UP' && <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />}
                  {currentDomain.trend === 'DOWN' && <TrendingDown className="w-3.5 h-3.5 text-rose-600" />}
                  {currentDomain.trend === 'STABLE' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                  <span className="font-bold">{currentDomain.trend}</span>
                </span>
              </div>
            </div>

            <p className="text-xs md:text-sm text-[#5F7668] leading-relaxed font-medium">{currentDomain.desc}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {currentDomain.indicators.map((ind, i) => (
                <div key={i} className="bg-[#F5F1E7] border border-[#17352A]/10 p-4 rounded-xl flex items-center justify-between gap-3 shadow-xs">
                  <span className="text-xs text-[#17352A] font-semibold leading-tight pr-1">{ind.label}</span>
                  <span className="font-mono text-sm font-bold text-[#B87932] whitespace-nowrap shrink-0">{ind.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Village GIS Asset & Issue Map */}
          <VillageGISMap 
            villageInfo={villageInfo} 
            grievances={grievances} 
            lang={lang} 
            t={t} 
          />

          {/* Feature 5: AI 'What-If' Predictive Simulator */}
          <AIPredictiveSimulator 
            baselineScore={metrics.developmentScore} 
            t={t} 
            lang={lang} 
          />

          {/* Budget & Schemes Overview */}
          <div className="gov-card-static rounded-3xl p-6 flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-[#17352A]/10 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#B87932] uppercase">{t.financialDisclosures}</span>
                <h4 className="font-heading font-bold text-xl text-[#17352A] mt-1">{t.villageBudget}</h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#5F7668] block">{t.yearCycle}</span>
                <span className="text-xs font-mono font-bold text-[#17352A]">{budget.year}</span>
              </div>
            </div>

            {/* Spent progress bar */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#5F7668] font-medium">{t.budgetSpentProgress}</span>
                <span className="text-[#B87932] font-bold">{spentPercent}%</span>
              </div>
              <div className="w-full h-3 bg-[#F5F1E7] rounded-full overflow-hidden border border-[#17352A]/10">
                <div 
                  className="h-full bg-[#B87932] transition-all duration-1000" 
                  style={{ width: `${spentPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#5F7668] font-mono mt-1">
                <span>{t.totalSpent}: ₹{(budget.totalSpent / 100000).toFixed(1)} Lakhs</span>
                <span>{t.allocation}: ₹{(budget.totalAllocation / 100000).toFixed(1)} Lakhs</span>
              </div>
            </div>

            {/* Allocation breakdown */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-[#F5F1E7] border border-[#17352A]/10 p-4 rounded-xl flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase text-[#5F7668] font-bold">{t.infraAlloc}</span>
                <span className="text-xl font-heading font-black text-[#17352A] font-mono-num">₹{(budget.infrastructureAlloc / 100000).toFixed(2)} L</span>
                <span className="text-[9px] text-[#5F7668] leading-none">{t.infraDesc}</span>
              </div>
              <div className="bg-[#F5F1E7] border border-[#17352A]/10 p-4 rounded-xl flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase text-[#5F7668] font-bold">{t.welfareAlloc}</span>
                <span className="text-xl font-heading font-black text-[#17352A] font-mono-num">₹{(budget.welfareAlloc / 100000).toFixed(2)} L</span>
                <span className="text-[9px] text-[#5F7668] leading-none">{t.welfareDesc}</span>
              </div>
            </div>

            {/* Schemes list */}
            <div className="mt-4">
              <h5 className="text-xs font-mono font-bold text-[#B87932] uppercase tracking-wider mb-3">{t.schemeList}</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#17352A]/10 text-[#5F7668] font-mono">
                      <th className="py-2.5 font-bold">{t.schemeName}</th>
                      <th className="py-2.5 font-bold">{t.allocation}</th>
                      <th className="py-2.5 font-bold">{t.utilized}</th>
                      <th className="py-2.5 font-bold text-right">{t.status}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#17352A]/5">
                    {schemes.map(s => (
                      <tr key={s.id} className="hover:bg-[#F5F1E7]/50 transition-colors">
                        <td className="py-3 font-semibold text-[#17352A]">{s.name}</td>
                        <td className="py-3 font-mono text-[#5F7668]">₹{(s.allocatedBudget / 100000).toFixed(1)} L</td>
                        <td className="py-3 font-mono text-[#5F7668]">₹{(s.spentBudget / 100000).toFixed(1)} L</td>
                        <td className="py-3 text-right">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${
                            s.status === 'Completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                            s.status === 'In Progress' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                            'bg-rose-50 border-rose-200 text-rose-800'
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

          {/* Feature 3: Participatory Budgeting Poll Card */}
          <ParticipatoryBudgetPoll t={t} lang={lang} />

          {/* Feature 6: Gram Sabha Transparency Wall & Community Hall of Fame */}
          <VillageHallOfFame t={t} lang={lang} />

          {/* Citizen Grievance Portal Card */}
          <div id="grievance-portal" className="gov-card-static rounded-3xl p-6 flex flex-col gap-6 scroll-mt-28">
            <div className="flex justify-between items-center border-b border-[#17352A]/10 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#B87932] uppercase">{t.publicAccountability}</span>
                <h4 className="font-heading font-bold text-xl text-[#17352A] mt-1">{t.citizenGrievances}</h4>
              </div>
              <button
                onClick={() => setShowGrievanceForm(true)}
                className="bg-[#B87932] hover:bg-[#B87932]/90 text-white font-bold text-xs font-mono px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" /> {t.fileComplaint}
              </button>
            </div>

            {/* Grievances List */}
            <div className="flex flex-col gap-4">
              {grievances.map(g => {
                const isNewCase = typeof g.id === 'string' && g.id.startsWith('TS-GRM-');
                const isExpanded = expandedGrievanceId === g.id;
                const upvotes = upvotesMap[g.id] || 0;
                const isUrgent = upvotes >= 5;
                const isResolved = g.status === 'Resolved';
                const userRating = ratingsMap[g.id] || 0;
                const isUserVerified = verifiedMap[g.id] || false;
                
                const timeline = g.timeline || [
                  { status: 'Submitted', time: '09:30 AM', detail: 'Grievance submitted by citizen via LGD Public Portal' },
                  { status: 'Assigned', time: '11:15 AM', detail: `Dispatched to Mandal Officer (${villageInfo.mandalName} Office)` },
                  { status: 'Investigating', time: '02:00 PM', detail: 'Gram Panchayat Secretary initiated on-site verification.' },
                  ...(g.status === 'Resolved' ? [{ status: 'Resolved', time: '05:00 PM', detail: 'Resolution approved. Corrective action deployed & verified on site.' }] : [])
                ];

                return (
                  <div key={g.id} className="bg-[#F5F1E7] border border-[#17352A]/10 p-5 rounded-2xl flex flex-col gap-4 transition-all duration-300">
                    
                    {/* Header line: Title, Case Badge, Status */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h5 className="font-heading font-bold text-base text-[#17352A]">{g.title}</h5>
                          
                          {/* Collector Urgent Escalation Badge */}
                          {isUrgent && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                              <ShieldAlert className="w-3 h-3 text-rose-700" />
                              {t.urgentCollector}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#5F7668] font-mono mt-1 font-medium">
                          <span className="font-bold text-[#B87932]">{g.id}</span>
                          <span>•</span>
                          <span>{t.categorySector}: {g.category}</span>
                          <span>•</span>
                          <span>{new Date(g.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border shrink-0 ${
                        g.status === 'Resolved' ? 'bg-emerald-100 border-emerald-300 text-emerald-800' :
                        g.status === 'Submitted' ? 'bg-blue-100 border-blue-300 text-blue-800' :
                        g.status === 'Assigned' ? 'bg-indigo-100 border-indigo-300 text-indigo-800' :
                        g.status === 'Investigating' ? 'bg-amber-100 border-amber-300 text-amber-800' :
                        'bg-rose-100 border-rose-300 text-rose-800'
                      }`}>
                        {g.status === 'Resolved' && <CheckCircle className="w-3 h-3 text-emerald-700" />}
                        {g.status === 'Submitted' && <Clock className="w-3 h-3 text-blue-700" />}
                        {g.status === 'Assigned' && <Clock className="w-3 h-3 text-indigo-700" />}
                        {g.status === 'Investigating' && <Clock className="w-3 h-3 text-amber-700" />}
                        {g.status === 'Pending' && <AlertCircle className="w-3 h-3 text-rose-700" />}
                        {g.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#17352A] leading-relaxed font-medium">{g.description}</p>

                    {g.attachment && (
                      <div className="flex items-center gap-1.5 self-start bg-white border border-[#17352A]/10 px-3 py-1 rounded-lg text-[10px] font-mono text-[#5F7668] shadow-2xs">
                        <Paperclip className="w-3.5 h-3.5 text-[#B87932]" />
                        <span>{t.attachEvidence}:</span>
                        <span className="text-[#17352A] font-bold">{g.attachment}</span>
                      </div>
                    )}

                    {/* Community Upvoting ("Me Too") and Live Tracking Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#17352A]/10 pt-3 mt-1">
                      
                      {/* Community Upvote Button (1 endorsement per citizen) */}
                      {(() => {
                        const hasEndorsed = !!userEndorsedMap[g.id];
                        return (
                          <button
                            onClick={() => handleUpvote(g.id)}
                            className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                              hasEndorsed
                                ? 'bg-[#B87932] text-white border-[#B87932] shadow-xs hover:bg-[#965C20]'
                                : 'bg-white border-[#17352A]/15 text-[#17352A] hover:border-[#B87932] hover:bg-[#F5F1E7]'
                            }`}
                            title={hasEndorsed ? (lang === 'te' ? 'మద్దతు ఉపసంహరించడానికి క్లిక్ చేయండి' : 'Click to withdraw your endorsement') : (lang === 'te' ? 'ఈ సమస్యకు మీ మద్దతు తెలపండి (1 సారి మాత్రమే)' : 'Endorse this issue (1 vote per citizen)')}
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${hasEndorsed ? 'text-white fill-white' : 'text-[#B87932]'}`} />
                            <span>{hasEndorsed ? (lang === 'te' ? 'మద్దతు తెలిపారు ✓' : 'Endorsed ✓') : t.affectedCount}</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                              hasEndorsed ? 'bg-white/25 text-white' : 'bg-[#B87932] text-white'
                            }`}>
                              +{upvotes}
                            </span>
                          </button>
                        );
                      })()}

                      {/* Live Simulation Indicator */}
                      {isNewCase && g.status !== 'Resolved' ? (
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                          <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider animate-pulse">
                            {t.liveTrackingActive}
                          </span>
                        </div>
                      ) : null}

                      {/* Timeline Expand Toggle */}
                      <button
                        onClick={() => setExpandedGrievanceId(isExpanded ? null : g.id)}
                        className="text-xs font-mono font-bold text-[#B87932] hover:text-[#965C20] flex items-center gap-1 transition-all cursor-pointer"
                      >
                        {isExpanded ? `▲ ${t.hideLiveTimeline}` : `🔍 ${t.trackCaseTimeline} ▼`}
                      </button>
                    </div>

                    {/* Before & After Proof Gallery for Resolved Issues */}
                    {isResolved && (
                      <div className="bg-white border border-[#17352A]/10 rounded-2xl p-4 flex flex-col gap-3 shadow-xs">
                        <div className="flex justify-between items-center border-b border-[#17352A]/10 pb-2">
                          <span className="text-xs font-heading font-bold text-[#17352A] flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            {t.beforeAfterTitle}
                          </span>
                          <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                            Field Inspection Certified
                          </span>
                        </div>

                        {/* Side-by-side Before/After cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-[#F5F1E7] border border-[#17352A]/10 rounded-xl p-3 flex flex-col gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-rose-700 uppercase">{t.beforeLabel}</span>
                            <div className="h-24 bg-stone-200 rounded-lg flex items-center justify-center text-xs text-[#5F7668] border border-dashed border-[#17352A]/20 font-mono">
                              📷 Photo: Leakage & Damage
                            </div>
                            <span className="text-[9px] text-[#5F7668]">Timestamp: {new Date(g.createdAt).toLocaleDateString()}</span>
                          </div>

                          <div className="bg-[#F5F1E7] border border-[#17352A]/10 rounded-xl p-3 flex flex-col gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">{t.afterLabel}</span>
                            <div className="h-24 bg-emerald-100/70 rounded-lg flex items-center justify-center text-xs text-emerald-800 border border-dashed border-emerald-300 font-mono font-bold">
                              ✓ Photo: Repaired & Tested
                            </div>
                            <span className="text-[9px] text-emerald-700 font-medium">Verified by: Panchayat Secretary</span>
                          </div>
                        </div>

                        {/* Citizen Satisfaction Rating & Verification */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#17352A]/10 pt-2 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-medium text-[#5F7668]">{t.citizenSatisfaction}:</span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  onClick={() => {
                                    setRatingsMap(prev => ({ ...prev, [g.id]: star }));
                                    toast.success(t.ratingThanks);
                                  }}
                                  className={`w-4 h-4 cursor-pointer transition-all ${
                                    (ratingsMap[g.id] || 0) >= star
                                      ? 'text-amber-500 fill-amber-400'
                                      : 'text-stone-300 hover:text-amber-400'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          {isUserVerified ? (
                            <span className="text-[10px] font-mono font-bold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              {t.verifiedFixed}
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setVerifiedMap(prev => ({ ...prev, [g.id]: true }));
                                toast.success(t.verifiedFixed);
                              }}
                              className="text-[10px] font-mono font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                            >
                              {t.markVerified}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Timeline Checkpoints */}
                    {isExpanded && (
                      <div className="bg-white border border-[#17352A]/10 rounded-2xl p-5 mt-1 flex flex-col gap-4 shadow-sm animate-fade-in-up">
                        <div className="flex justify-between items-center border-b border-[#17352A]/10 pb-2">
                          <span className="text-[10px] font-mono font-bold text-[#B87932] uppercase">{t.liveAuditCheckpoints}</span>
                          <span className="text-[10px] font-mono text-[#5F7668] font-bold">{t.caseRef}: {g.id}</span>
                        </div>
                        
                        <div className="flex flex-col gap-4 pl-3 relative border-l-2 border-[#B87932]/30">
                          {timeline.map((step, idx) => {
                            const isLast = idx === timeline.length - 1;
                            return (
                              <div key={idx} className="relative pl-5 flex flex-col gap-0.5">
                                <div className={`absolute -left-[19px] top-1 w-3 h-3 rounded-full border-2 ${
                                  step.status === 'Resolved' ? 'bg-emerald-500 border-emerald-600' :
                                  isLast && g.status !== 'Resolved' ? 'bg-amber-500 border-amber-600 animate-pulse' :
                                  'bg-slate-400 border-slate-500'
                                }`} />
                                <div className="flex justify-between items-center gap-4">
                                  <span className="text-xs font-bold text-[#17352A]">{step.status}</span>
                                  <span className="text-[10px] font-mono text-[#5F7668]">{step.time}</span>
                                </div>
                                <p className="text-xs text-[#5F7668] leading-relaxed font-medium">{step.detail}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </div>

        </section>

      </main>

      {/* Feature 1: Floating "Gram Mitra" AI Copilot */}
      <GramMitraChat 
        data={data} 
        lang={lang} 
        t={t} 
        onOpenGrievanceForm={() => setShowGrievanceForm(true)} 
      />

      {/* Feature 2: Mandal Benchmark Comparison Modal */}
      <VillageComparisonModal
        isOpen={showComparisonModal}
        onClose={() => setShowComparisonModal(false)}
        currentVillage={villageInfo}
        metrics={metrics}
        t={t}
      />

      {/* WhatsApp Live Status Notification Toast Simulation */}
      {activeWhatsAppToast && (
        <div className="fixed bottom-6 left-6 z-[99999] bg-[#128C7E] text-white p-4 rounded-2xl shadow-2xl flex items-start gap-3.5 max-w-sm animate-fade-in border border-emerald-300">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-[#128C7E]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs">Panchayat Raj Grievance Alert</span>
              <span className="text-[9px] text-white/80 font-mono">{activeWhatsAppToast.time}</span>
            </div>
            <span className="text-[11px] font-bold text-amber-200 font-mono">Case #{activeWhatsAppToast.caseId}</span>
            <p className="text-xs text-white/95 leading-snug">
              Status Updated: <strong>{activeWhatsAppToast.status}</strong>. {activeWhatsAppToast.detail}
            </p>
          </div>
        </div>
      )}

      {/* Official Audit Dossier Modal Component */}
      <OfficialAuditDossierModal
        isOpen={showDossierModal}
        onClose={() => setShowDossierModal(false)}
        data={data}
        lang={lang}
      />

      {/* File Grievance Dialog Overlay Modal (Viewport Top Level) */}
      {showGrievanceForm && (
        <div className="fixed inset-0 bg-[#17352A]/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#F5F1E7] border border-[#17352A]/15 w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-[#17352A]/10 pb-4 mb-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono font-bold text-[#B87932] uppercase tracking-wider">{t.publicAccountability}</span>
                <h3 className="font-heading font-black text-2xl text-[#17352A]">
                  {t.submitGrievance}
                </h3>
                <p className="text-xs text-[#5F7668]">{t.submitGrievanceSub}</p>
              </div>
              <button
                onClick={() => setShowGrievanceForm(false)}
                className="text-xs font-mono font-bold text-[#5F7668] hover:text-rose-700 border border-[#17352A]/15 hover:border-rose-300 bg-white px-3 py-1.5 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                {t.cancel} (ESC)
              </button>
            </div>

            <form onSubmit={handleGrievanceSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono text-[#17352A] uppercase font-bold">{t.complaintTitle} *</label>
                  <input 
                    type="text" 
                    required
                    placeholder={lang === 'te' ? 'ఉదా: మెయిన్ రోడ్డు వద్ద తాగునీటి పైప్‌లైన్ లీకేజీ' : 'e.g. Broken water pipeline on main street'}
                    value={grievanceForm.title}
                    onChange={(e) => setGrievanceForm(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-white border border-[#17352A]/15 focus:border-[#B87932] rounded-xl px-4 py-2.5 text-xs text-[#17352A] outline-none shadow-xs font-medium"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono text-[#17352A] uppercase font-bold">{t.categorySector} *</label>
                  <select 
                    value={grievanceForm.category}
                    onChange={(e) => setGrievanceForm(prev => ({ ...prev, category: e.target.value }))}
                    className="bg-white border border-[#17352A]/15 focus:border-[#B87932] rounded-xl px-4 py-2.5 text-xs text-[#17352A] outline-none shadow-xs font-medium cursor-pointer"
                  >
                    <option value="Water">{t.water}</option>
                    <option value="Education">{t.education}</option>
                    <option value="Health">{t.health}</option>
                    <option value="Agriculture">{t.agriculture}</option>
                    <option value="Governance">{t.governance}</option>
                  </select>
                </div>
              </div>

              {/* Description Field with Voice Recording Option */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono text-[#17352A] uppercase font-bold">{t.descriptionDetails} *</label>
                  
                  {/* Feature: Voice Grievance Record Button */}
                  <button
                    type="button"
                    onClick={handleVoiceToggle}
                    className={`text-xs font-mono font-bold px-3 py-1 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                      isRecording 
                        ? 'bg-rose-600 text-white border-rose-600 animate-pulse' 
                        : 'bg-white border-[#17352A]/15 text-[#17352A] hover:border-[#B87932] hover:text-[#B87932]'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-3.5 h-3.5" />
                        <span>{t.voiceStop} ({recordingSeconds}s)</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-[#B87932]" />
                        <span>{t.voiceRecord}</span>
                      </>
                    )}
                  </button>
                </div>

                {isRecording && (
                  <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl flex items-center gap-2 text-xs text-rose-800 font-mono">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
                    <span>{t.voiceRecording}</span>
                  </div>
                )}

                <textarea 
                  rows="4" 
                  required
                  placeholder={lang === 'te' ? 'సమస్య ఎక్కడ ఉంది, ఎన్నాళ్లుగా ఉంది మరియు ఇతర వివరాలను ఇక్కడ రాయండి లేదా మైక్ నొక్కి చెప్పండి...' : 'Please specify address location, duration of the issue and details of the complaint...'}
                  value={grievanceForm.description}
                  onChange={(e) => setGrievanceForm(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-white border border-[#17352A]/15 focus:border-[#B87932] rounded-xl px-4 py-2.5 text-xs text-[#17352A] outline-none resize-none shadow-xs font-medium"
                />
              </div>

              {/* Mobile Phone & WhatsApp Live Alert Opt-In */}
              <div className="bg-white border border-[#17352A]/15 p-4 rounded-xl flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enableWhatsApp"
                    checked={grievanceForm.enableWhatsApp}
                    onChange={(e) => setGrievanceForm(prev => ({ ...prev, enableWhatsApp: e.target.checked }))}
                    className="w-4 h-4 text-[#B87932] accent-[#B87932] rounded cursor-pointer"
                  />
                  <label htmlFor="enableWhatsApp" className="text-xs font-mono font-bold text-[#17352A] flex items-center gap-1.5 cursor-pointer">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t.whatsAppAlerts}</span>
                  </label>
                </div>

                {grievanceForm.enableWhatsApp && (
                  <input
                    type="tel"
                    placeholder={t.phonePlaceholder}
                    value={grievanceForm.phone}
                    onChange={(e) => setGrievanceForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="bg-[#F5F1E7] border border-[#17352A]/15 focus:border-[#B87932] rounded-xl px-4 py-2 text-xs text-[#17352A] outline-none font-mono"
                  />
                )}
              </div>

              {/* Attach File Evidence */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[#17352A] uppercase font-bold">{t.attachEvidence}</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer bg-white border border-[#17352A]/15 hover:border-[#B87932] px-4 py-2.5 rounded-xl text-xs text-[#17352A] hover:text-[#B87932] transition-all flex items-center gap-2 shadow-xs font-bold">
                    <Paperclip className="w-4 h-4 text-[#B87932]" />
                    <span>Choose File</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFileName(file.name);
                          setSelectedFile(file);
                        }
                      }}
                    />
                  </label>
                  {selectedFileName ? (
                    <div className="flex items-center gap-2 bg-white border border-[#17352A]/15 px-3.5 py-2 rounded-xl text-xs text-[#17352A] shadow-xs">
                      <span className="truncate max-w-[200px] font-mono text-[11px] text-[#17352A] font-semibold">📎 {selectedFileName}</span>
                      <button 
                        type="button" 
                        onClick={() => {
                          setSelectedFileName('');
                          setSelectedFile(null);
                        }}
                        className="text-rose-600 font-bold hover:scale-110 ml-2 cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-[#5F7668] font-mono">No file chosen (Optional)</span>
                  )}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 mt-4 border-t border-[#17352A]/10 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowGrievanceForm(false)}
                  className="bg-white border border-[#17352A]/15 hover:text-rose-700 px-5 py-2.5 rounded-xl text-xs text-[#17352A] font-bold transition-all shadow-xs cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit" 
                  className="bg-[#B87932] hover:bg-[#B87932]/90 text-white font-bold text-xs font-mono px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer hover:scale-[1.02]"
                >
                  {t.submitAndEscalate}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
