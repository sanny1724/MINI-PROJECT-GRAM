// src/pages/LandingPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, MapPin, ArrowRight, ShieldAlert, Layers, 
  DollarSign, Activity, FileText, Droplet, GraduationCap, 
  Plus, CheckCircle2, Phone, LogIn, Compass, Check
} from 'lucide-react';
import api from '../api';
import { telanganaMapData } from '../assets/telangana-districts';

// Helper for seeded random coordinates
function getSeededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function LandingPage() {
  const navigate = useNavigate();
  
  // Navigation states
  const [activeTab, setActiveTab] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);

  // Map & LGD states
  const [viewMode, setViewMode] = useState('state'); // 'state' | 'district' | 'mandal'
  const [selectedDistrict, setSelectedDistrict] = useState(null); // { code, name, bbox }
  const [selectedMandal, setSelectedMandal] = useState(null); // { code, name, x, y }
  
  const [hoveredDistrict, setHoveredDistrict] = useState(null);
  const [hoveredMandal, setHoveredMandal] = useState(null);
  const [hoveredVillage, setHoveredVillage] = useState(null);

  const [mandalsList, setMandalsList] = useState([]);
  const [villagesList, setVillagesList] = useState([]);
  const [dbDistricts, setDbDistricts] = useState([]);

  useEffect(() => {
    const fetchDbDistricts = async () => {
      try {
        const response = await api.get('/geo/districts');
        setDbDistricts(response.data);
      } catch (err) {
        console.error('Error fetching DB districts on mount:', err);
      }
    };
    fetchDbDistricts();
  }, []);

  // SVG viewBox state (matches default size in telangana-districts.js)
  const defaultViewBox = '0 0 930 880';
  const [viewBox, setViewBox] = useState(defaultViewBox);
  const mapSvgRef = useRef(null);

  // Search autocomplete states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Statistics states (animated)
  const [stats, setStats] = useState({
    districts: 0,
    mandals: 0,
    villages: 0,
    citizens: 0
  });

  // Track scrolling for sticky navbar & counter animation
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    // Stat counter animation trigger on mount
    const duration = 1800; // ms
    const startTime = performance.now();

    const animateStats = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing out quadratic
      const easeProgress = progress * (2 - progress);

      setStats({
        districts: Math.round(easeProgress * 33),
        mandals: Math.round(easeProgress * 621),
        villages: Math.round(easeProgress * 11308),
        citizens: Math.round(easeProgress * 35) // In Millions
      });

      if (progress < 1) {
        requestAnimationFrame(animateStats);
      }
    };

    requestAnimationFrame(animateStats);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle outside click for search dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search query effect
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await api.get(`/geo/search?q=${searchQuery}`);
        setSearchResults(response.data);
        setShowDropdown(true);
      } catch (err) {
        console.error('Error searching DB geo:', err);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Handle autocomplete selection
  const handleSearchSelect = (item) => {
    setSearchQuery('');
    setShowDropdown(false);
    
    if (item.type === 'Village') {
      // Direct jump to village dashboard
      navigate(`/public/village/${item.code}`);
    } else if (item.type === 'District') {
      // Find district element in path and trigger zoom
      const found = telanganaMapData.districts.find(
        d => d.name.toLowerCase() === item.name.toLowerCase()
      );
      if (found) {
        // Mock a click event target having getBBox
        const svgEl = mapSvgRef.current;
        if (svgEl) {
          const pathEl = svgEl.querySelector(`[name="${found.name}"]`);
          if (pathEl) {
            zoomToDistrict(found.name, found.code, pathEl.getBBox());
          }
        }
      }
    }
  };

  // Zoom to District handler
  const zoomToDistrict = async (districtName, districtCode, bbox) => {
    // Resolve DB ID using districtName mapping
    const matched = dbDistricts.find(
      d => d.name.toLowerCase() === districtName.toLowerCase()
    );
    const dbId = matched ? matched.id : (districtCode || 1);

    setSelectedDistrict({ code: dbId, name: districtName, bbox });
    setSelectedMandal(null);
    setMandalsList([]);
    setVillagesList([]);
    setViewMode('district');

    // Fetch Mandals
    try {
      const response = await api.get(`/geo/districts/${dbId}/mandals`);
      const formattedMandals = response.data.map(m => ({
        ...m,
        code: m.id
      }));
      setMandalsList(formattedMandals);
    } catch (err) {
      console.error('Error fetching mandals:', err);
    }

    // Set padded ViewBox around bounding box of clicked district path
    const padX = bbox.width * 0.15;
    const padY = bbox.height * 0.15;
    setViewBox(`${bbox.x - padX} ${bbox.y - padY} ${bbox.width + padX * 2} ${bbox.height + padY * 2}`);
  };

  // Zoom to Mandal handler
  const zoomToMandal = async (mandal, index, bbox) => {
    // Generate deterministic coordinates inside the district's bbox
    const distBBox = selectedDistrict.bbox;
    const mCode = mandal.code || mandal.id;
    const mX = distBBox.x + distBBox.width * (0.2 + getSeededRandom(mCode * 2) * 0.6);
    const mY = distBBox.y + distBBox.height * (0.2 + getSeededRandom(mCode * 3) * 0.6);

    setSelectedMandal({ code: mCode, name: mandal.name, x: mX, y: mY });
    setVillagesList([]);
    setViewMode('mandal');

    // Fetch Villages
    try {
      const response = await api.get(`/geo/mandals/${mCode}/villages`);
      const formattedVillages = response.data.map(v => ({
        ...v,
        code: v.id
      }));
      setVillagesList(formattedVillages);
    } catch (err) {
      console.error('Error fetching villages:', err);
    }

    // Zoom viewBox in tightly around the mandal centroid
    setViewBox(`${mX - 25} ${mY - 25} 50 50`);
  };

  // Reset to State view
  const resetToState = () => {
    setSelectedDistrict(null);
    setSelectedMandal(null);
    setMandalsList([]);
    setVillagesList([]);
    setViewBox(defaultViewBox);
    setViewMode('state');
  };

  // Reset to District view (if in mandal view)
  const resetToDistrict = () => {
    setSelectedMandal(null);
    setVillagesList([]);
    setViewMode('district');
    
    // Zoom back out to district bbox
    const bbox = selectedDistrict.bbox;
    const padX = bbox.width * 0.15;
    const padY = bbox.height * 0.15;
    setViewBox(`${bbox.x - padX} ${bbox.y - padY} ${bbox.width + padX * 2} ${bbox.height + padY * 2}`);
  };

  // Map click handler (filters paths)
  const handleDistrictPathClick = (district, e) => {
    // Translate SVG path node bounding box
    const bbox = e.target.getBBox();
    zoomToDistrict(district.name, district.code, bbox);
  };

  const handleDistrictListClick = (d) => {
    const pathEl = document.querySelector(`path[name="${d.name}"]`);
    const bbox = pathEl ? pathEl.getBBox() : { x: 100, y: 100, width: 300, height: 300 };
    zoomToDistrict(d.name, d.code, bbox);
  };

  const handleMandalListClick = (m, idx) => {
    zoomToMandal(m, idx);
  };

  return (
    <div className="min-h-screen bg-[#16241D] text-[#F2F0E6] font-sans selection:bg-[#C98A2E] selection:text-[#16241D] overflow-x-hidden">
      
      {/* SECTION 1 — NAVIGATION BAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#16241D]/90 backdrop-blur-md border-b border-[#F2F0E6]/10 shadow-lg py-4' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-[#C98A2E] rounded-xl flex items-center justify-center shadow-lg shadow-[#C98A2E]/20">
              <span className="font-heading font-black text-xl text-[#16241D] tracking-tighter">G</span>
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-xl leading-none text-[#F2F0E6] tracking-tight">GRAM</span>
              <span className="text-[10px] text-[#C98A2E] font-mono tracking-widest uppercase">Telangana Governance</span>
            </div>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#home" onClick={() => setActiveTab('home')} className={`hover:text-[#C98A2E] transition-colors ${activeTab === 'home' ? 'text-[#C98A2E]' : 'text-[#F2F0E6]/70'}`}>Home</a>
            <a href="#explore" onClick={() => setActiveTab('explore')} className={`hover:text-[#C98A2E] transition-colors ${activeTab === 'explore' ? 'text-[#C98A2E]' : 'text-[#F2F0E6]/70'}`}>Explore Telangana</a>
            <a href="#features" onClick={() => setActiveTab('features')} className={`hover:text-[#C98A2E] transition-colors ${activeTab === 'features' ? 'text-[#C98A2E]' : 'text-[#F2F0E6]/70'}`}>Features</a>
            <a href="#about" onClick={() => setActiveTab('about')} className={`hover:text-[#C98A2E] transition-colors ${activeTab === 'about' ? 'text-[#C98A2E]' : 'text-[#F2F0E6]/70'}`}>About</a>
            <a href="#contact" onClick={() => setActiveTab('contact')} className={`hover:text-[#C98A2E] transition-colors ${activeTab === 'contact' ? 'text-[#C98A2E]' : 'text-[#F2F0E6]/70'}`}>Contact</a>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                const sec = document.getElementById('explore');
                if (sec) sec.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs font-mono font-bold uppercase tracking-wider text-[#F2F0E6]/80 hover:text-[#C98A2E] border border-[#F2F0E6]/20 hover:border-[#C98A2E] px-4 py-2 rounded-lg transition-all"
            >
              Public Dashboard
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="bg-[#C98A2E] hover:bg-[#b07824] text-[#16241D] font-bold text-sm px-5 py-2.5 rounded-lg shadow-md hover:shadow-[#C98A2E]/25 transition-all flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Officer Login
            </button>
          </div>
        </div>
      </nav>

      {/* SECTION 2 — HERO SECTION WITH BACKGROUND VIDEO */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Cinematic Video */}
        <div className="absolute inset-0 w-full h-full object-cover z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            poster="src/assets/hero.png"
          >
            <source src="/videos/telangana-heritage.mp4" type="video/mp4" />
          </video>
          {/* Subtle dark green/black overlay to maximize readability and state identity */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#16241D]/90 via-[#16241D]/80 to-[#16241D]" />
        </div>

        {/* Traditional Telangana Line/Architectural motifs (top/bottom borders) */}
        <div className="absolute top-24 left-0 right-0 h-1 bg-[repeating-linear-gradient(90deg,#C98A2E,#C98A2E_10px,transparent_10px,transparent_20px)] opacity-20 z-10" />

        <div className="max-w-4xl mx-auto w-full px-6 text-center z-10 flex flex-col items-center gap-8 pt-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#24382C]/70 border border-[#C98A2E]/25 text-[10px] font-mono font-bold tracking-widest text-[#C98A2E] uppercase backdrop-blur-sm animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C98A2E] animate-ping" />
            Telangana State Portal
          </div>
          
          <div className="flex flex-col gap-3">
            <h1 className="font-heading font-black text-6xl md:text-8xl tracking-tight text-white leading-none">
              GRAM
            </h1>
            <h2 className="font-heading font-bold text-lg md:text-2xl text-[#C98A2E] tracking-wider uppercase">
              Governance Risk & Accountability Monitor
            </h2>
          </div>

          <div className="flex flex-col gap-4 max-w-2xl">
            <p className="font-heading text-xl md:text-3xl text-white font-normal italic leading-relaxed">
              "Transparency for Every Village. Accountability for Every Citizen."
            </p>
            <p className="text-sm md:text-base text-[#F2F0E6]/70 leading-relaxed font-light">
              Connecting Telangana's villages, people and governance through transparent data and intelligent insights.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <button 
              onClick={() => {
                const sec = document.getElementById('explore');
                if (sec) sec.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-[#C98A2E] hover:bg-[#b07824] text-[#16241D] font-bold text-sm px-8 py-4 rounded-xl shadow-lg shadow-[#C98A2E]/20 transition-all flex items-center justify-center gap-2.5 group"
            >
              Explore Your Village
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="border border-[#F2F0E6]/25 hover:border-[#C98A2E] hover:bg-[#24382C]/30 text-[#F2F0E6] font-bold text-sm px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              Officer Login
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 3 — LIVE GOVERNANCE NUMBERS */}
      <section className="py-12 bg-[#24382C]/50 border-y border-[#F2F0E6]/10 relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-8">
          
          <div className="flex flex-col items-center text-center">
            <span className="counter-text font-heading text-4xl md:text-5xl text-[#C98A2E] font-bold">{stats.districts}</span>
            <span className="text-[11px] text-[#F2F0E6]/60 font-mono tracking-wider uppercase mt-2">Districts</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="counter-text font-heading text-4xl md:text-5xl text-[#C98A2E] font-bold">{stats.mandals}</span>
            <span className="text-[11px] text-[#F2F0E6]/60 font-mono tracking-wider uppercase mt-2">Mandals</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="counter-text font-heading text-4xl md:text-5xl text-[#C98A2E] font-bold">{stats.villages.toLocaleString()}</span>
            <span className="text-[11px] text-[#F2F0E6]/60 font-mono tracking-wider uppercase mt-2">Villages</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="counter-text font-heading text-4xl md:text-5xl text-[#C98A2E] font-bold">{stats.citizens}M+</span>
            <span className="text-[11px] text-[#F2F0E6]/60 font-mono tracking-wider uppercase mt-2">Citizens Enrolled</span>
          </div>

          <div className="flex flex-col items-center text-center col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 justify-center">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
              <span className="font-heading text-2xl md:text-3xl text-white font-bold">24×7</span>
            </div>
            <span className="text-[11px] text-[#F2F0E6]/60 font-mono tracking-wider uppercase mt-2">AI Governance Monitoring</span>
          </div>

        </div>
      </section>

      {/* SECTION 4 — WHAT IS GRAM */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center flex flex-col items-center gap-4 mb-16">
          <span className="text-xs font-mono font-bold tracking-widest text-[#C98A2E] uppercase">Governance Pipeline</span>
          <h2 className="font-heading text-4xl md:text-5xl text-white font-bold leading-tight">What is GRAM?</h2>
          <div className="w-16 h-1 bg-[#C98A2E]" />
        </div>

        {/* Timeline Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative">
          
          <div className="bg-[#24382C]/30 border border-[#F2F0E6]/10 p-6 rounded-2xl flex flex-col gap-4 timeline-item">
            <div className="w-12 h-12 rounded-xl bg-[#C98A2E]/10 border border-[#C98A2E]/30 flex items-center justify-center text-[#C98A2E] timeline-dot">
              <span className="font-mono text-lg font-bold">01</span>
            </div>
            <h3 className="font-heading text-lg font-bold text-white">Citizen</h3>
            <p className="text-xs text-[#F2F0E6]/70 leading-relaxed">
              Villagers file grievances, inspect scheme benefits, and monitor development works in real-time.
            </p>
          </div>

          <div className="bg-[#24382C]/30 border border-[#F2F0E6]/10 p-6 rounded-2xl flex flex-col gap-4 timeline-item">
            <div className="w-12 h-12 rounded-xl bg-[#C98A2E]/10 border border-[#C98A2E]/30 flex items-center justify-center text-[#C98A2E] timeline-dot">
              <span className="font-mono text-lg font-bold">02</span>
            </div>
            <h3 className="font-heading text-lg font-bold text-white">Village Data Collection</h3>
            <p className="text-xs text-[#F2F0E6]/70 leading-relaxed">
              Local directory, schemes, budgets, LGD variables, and water/education assets are integrated.
            </p>
          </div>

          <div className="bg-[#24382C]/30 border border-[#F2F0E6]/10 p-6 rounded-2xl flex flex-col gap-4 timeline-item">
            <div className="w-12 h-12 rounded-xl bg-[#C98A2E]/10 border border-[#C98A2E]/30 flex items-center justify-center text-[#C98A2E] timeline-dot">
              <span className="font-mono text-lg font-bold">03</span>
            </div>
            <h3 className="font-heading text-lg font-bold text-white">AI Risk Analysis</h3>
            <p className="text-xs text-[#F2F0E6]/70 leading-relaxed">
              GRAM algorithms process metrics to detect delays, identify financial anomalies, and compute risk levels.
            </p>
          </div>

          <div className="bg-[#24382C]/30 border border-[#F2F0E6]/10 p-6 rounded-2xl flex flex-col gap-4 timeline-item">
            <div className="w-12 h-12 rounded-xl bg-[#C98A2E]/10 border border-[#C98A2E]/30 flex items-center justify-center text-[#C98A2E] timeline-dot">
              <span className="font-mono text-lg font-bold">04</span>
            </div>
            <h3 className="font-heading text-lg font-bold text-white">Collector Dashboard</h3>
            <p className="text-xs text-[#F2F0E6]/70 leading-relaxed">
              District administration receives visual analytics, highlighting high-risk and delayed projects immediately.
            </p>
          </div>

          <div className="bg-[#24382C]/30 border border-[#F2F0E6]/10 p-6 rounded-2xl flex flex-col gap-4 timeline-item">
            <div className="w-12 h-12 rounded-xl bg-[#C98A2E]/10 border border-[#C98A2E]/30 flex items-center justify-center text-[#C98A2E] timeline-dot">
              <span className="font-mono text-lg font-bold">05</span>
            </div>
            <h3 className="font-heading text-lg font-bold text-white">Government Action</h3>
            <p className="text-xs text-[#F2F0E6]/70 leading-relaxed">
              Authorities review AI warnings, mobilize resources, resolve grievances, and enforce administrative accountability.
            </p>
          </div>

          <div className="bg-[#24382C]/30 border border-[#F2F0E6]/10 p-6 rounded-2xl flex flex-col gap-4 timeline-item">
            <div className="w-12 h-12 rounded-xl bg-[#C98A2E]/10 border border-[#C98A2E]/30 flex items-center justify-center text-[#C98A2E] timeline-dot">
              <span className="font-mono text-lg font-bold">06</span>
            </div>
            <h3 className="font-heading text-lg font-bold text-white">Village Development</h3>
            <p className="text-xs text-[#F2F0E6]/70 leading-relaxed">
              Risk scores plummet, public resources are fully optimized, and transparent governance becomes standard.
            </p>
          </div>

        </div>
      </section>

      {/* SECTION 5 — EXPLORE TELANGANA */}
      <section id="explore" className="py-24 px-6 bg-[#24382C]/30 border-y border-[#F2F0E6]/10 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(201,138,46,0.05),transparent_40%)] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6 mb-12">
          <span className="text-xs font-mono font-bold tracking-widest text-[#C98A2E] uppercase">GIS Interface</span>
          <h2 className="font-heading text-4xl md:text-5xl text-white font-bold leading-tight">Explore Telangana State</h2>
          <p className="text-sm text-[#F2F0E6]/70 max-w-xl">
            Search for your village LGD data, mandal summaries, or explore district-level accountability indexes directly using our central database search box or map portal below.
          </p>

          {/* Autocomplete Search Box */}
          <div className="relative w-full max-w-lg mt-4" ref={dropdownRef}>
            <div className="flex items-center bg-[#16241D] border border-[#F2F0E6]/15 focus-within:border-[#C98A2E] rounded-xl px-4 py-3 shadow-lg transition-all">
              <Search className="w-5 h-5 text-[#C98A2E] mr-3" />
              <input
                type="text"
                placeholder="Search Village, Mandal or District..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                className="w-full bg-transparent text-sm text-[#F2F0E6] outline-none placeholder:text-[#F2F0E6]/40 font-heading"
              />
            </div>

            {/* Dropdown list */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#16241D] border border-[#F2F0E6]/10 rounded-xl shadow-2xl overflow-hidden z-30 max-h-[300px] overflow-y-auto custom-scroll">
                {searchResults.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSearchSelect(item)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-[#24382C]/50 cursor-pointer border-b border-[#F2F0E6]/5 last:border-b-0 transition-colors"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold text-[#F2F0E6]">{item.name}</span>
                      <span className="text-[10px] text-[#F2F0E6]/50">{item.context}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#C98A2E]/10 text-[#C98A2E] border border-[#C98A2E]/25 px-2.5 py-0.5 rounded-full">
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {showDropdown && searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#16241D] border border-[#F2F0E6]/10 rounded-xl px-4 py-3 text-sm text-[#F2F0E6]/40 z-30 text-center">
                No results found
              </div>
            )}
          </div>
        </div>

        {/* Split screen Map & LGD Explorer Panel */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Map Pane (7 Columns) */}
          <div className="lg:col-span-7 bg-[#16241D]/90 border border-[#F2F0E6]/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between min-h-[480px]">
            <div className="flex items-center justify-between mb-4 border-b border-[#F2F0E6]/5 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-[#C98A2E] rounded-full animate-ping" />
                <h3 className="font-heading font-bold text-lg text-white">Live LGD Map</h3>
              </div>
              <button 
                onClick={resetToState}
                className="text-xs font-mono font-bold text-[#C98A2E] hover:underline"
              >
                Reset Map View
              </button>
            </div>

            <div className="aspect-[93/80] w-full flex items-center justify-center">
              {/* Embedded interactive map duplicating Hero map for exploration ease */}
              <svg
                viewBox={viewBox}
                className="w-full h-full max-h-[400px] object-contain transition-all duration-700 ease-out"
                style={{ transformOrigin: 'center' }}
              >
                {telanganaMapData.districts.map((d) => {
                  const isActive = selectedDistrict && selectedDistrict.name === d.name;
                  const isDimmed = selectedDistrict && selectedDistrict.name !== d.name;
                  return (
                    <path
                      key={`explore-${d.id}`}
                      d={d.d}
                      name={d.name}
                      className={`tg-map-district ${isActive ? 'active' : ''}`}
                      style={{
                        opacity: isDimmed ? 0.08 : 1,
                        pointerEvents: viewMode === 'state' ? 'auto' : 'none'
                      }}
                      onMouseEnter={() => setHoveredDistrict(d.name)}
                      onMouseLeave={() => setHoveredDistrict(null)}
                      onClick={(e) => handleDistrictPathClick(d, e)}
                    />
                  );
                })}

                {viewMode === 'district' && selectedDistrict && mandalsList.map((m, idx) => {
                  const bbox = selectedDistrict.bbox;
                  const seedX = m.code * 2;
                  const seedY = m.code * 3;
                  const mX = bbox.x + bbox.width * (0.25 + getSeededRandom(seedX) * 0.5);
                  const mY = bbox.y + bbox.height * (0.25 + getSeededRandom(seedY) * 0.5);
                  
                  return (
                    <circle
                      key={`explore-mandal-${m.code}`}
                      cx={mX}
                      cy={mY}
                      r={bbox.width * 0.025 + 1}
                      fill="#C98A2E"
                      fillOpacity="0.8"
                      stroke="#ffffff"
                      strokeWidth={bbox.width * 0.005}
                      className="animate-pulse cursor-pointer"
                      onMouseEnter={() => setHoveredMandal(m)}
                      onMouseLeave={() => setHoveredMandal(null)}
                      onClick={(e) => zoomToMandal(m, idx, e.target.getBBox())}
                    />
                  );
                })}

                {viewMode === 'mandal' && selectedMandal && villagesList.map((v, idx) => {
                  const mX = selectedMandal.x;
                  const mY = selectedMandal.y;
                  const angle = getSeededRandom(v.code * 4) * Math.PI * 2;
                  const dist = 3 + getSeededRandom(v.code * 5) * 12;
                  const vX = mX + Math.cos(angle) * dist;
                  const vY = mY + Math.sin(angle) * dist;
                  const color = v.riskLevel === 'LOW' ? '#66bb6a' : v.riskLevel === 'MEDIUM' ? '#ffa726' : '#ef5350';

                  return (
                    <circle
                      key={`explore-village-${v.code}`}
                      cx={vX}
                      cy={vY}
                      r={0.8}
                      fill={color}
                      stroke="#ffffff"
                      strokeWidth="0.15"
                      className="grid-cell-dot cursor-pointer"
                      onMouseEnter={() => setHoveredVillage(v)}
                      onMouseLeave={() => setHoveredVillage(null)}
                      onClick={() => navigate(`/public/village/${v.code}`)}
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          {/* List Hierarchy Explorer (5 Columns) */}
          <div className="lg:col-span-5 bg-[#24382C]/30 border border-[#F2F0E6]/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between min-h-[480px]">
            <div className="flex flex-col gap-1 border-b border-[#F2F0E6]/5 pb-3 mb-4">
              <span className="text-[10px] font-mono font-bold text-[#C98A2E] uppercase">Explore Hierarchy</span>
              <h3 className="font-heading font-bold text-lg text-white">LGD Explorer</h3>
            </div>

            {/* Breadcrumb Path */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#F2F0E6]/60 mb-4 bg-[#16241D]/55 px-3.5 py-2 rounded-xl font-mono">
              <button onClick={resetToState} className="hover:text-[#C98A2E] transition-colors">Telangana</button>
              {selectedDistrict && (
                <>
                  <span>/</span>
                  <button onClick={resetToDistrict} className="hover:text-[#C98A2E] transition-colors">{selectedDistrict.name}</button>
                </>
              )}
              {selectedMandal && (
                <>
                  <span>/</span>
                  <span className="text-white">{selectedMandal.name}</span>
                </>
              )}
            </div>

            {/* Lists based on View Mode */}
            {viewMode === 'state' && (
              <div className="flex-grow flex flex-col overflow-hidden">
                <span className="text-xs text-[#F2F0E6]/50 mb-2 block font-medium">Select District ({telanganaMapData.districts.length})</span>
                <div className="flex-grow overflow-y-auto max-h-[300px] pr-1 flex flex-col gap-1.5 custom-scroll">
                  {telanganaMapData.districts.map(d => (
                    <button
                      key={d.code}
                      onClick={() => handleDistrictListClick(d)}
                      className="w-full text-left px-4 py-2.5 bg-[#16241D]/45 hover:bg-[#24382C]/60 border border-[#F2F0E6]/5 hover:border-[#C98A2E]/30 rounded-xl text-xs font-semibold text-[#F2F0E6] hover:text-[#C98A2E] transition-all flex justify-between items-center"
                    >
                      <span>{d.name}</span>
                      <span className="text-[9px] font-mono text-[#F2F0E6]/40 uppercase">District</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {viewMode === 'district' && selectedDistrict && (
              <div className="flex-grow flex flex-col overflow-hidden">
                <span className="text-xs text-[#F2F0E6]/50 mb-2 block font-medium">Select Mandal ({mandalsList.length})</span>
                <div className="flex-grow overflow-y-auto max-h-[300px] pr-1 flex flex-col gap-1.5 custom-scroll">
                  {mandalsList.length === 0 ? (
                    <div className="text-xs text-[#F2F0E6]/40 py-8 text-center animate-pulse">Loading Mandals...</div>
                  ) : (
                    mandalsList.map((m, idx) => (
                      <button
                        key={m.code}
                        onClick={() => handleMandalListClick(m, idx)}
                        className="w-full text-left px-4 py-2.5 bg-[#16241D]/45 hover:bg-[#24382C]/60 border border-[#F2F0E6]/5 hover:border-[#C98A2E]/30 rounded-xl text-xs font-semibold text-[#F2F0E6] hover:text-[#C98A2E] transition-all flex justify-between items-center"
                      >
                        <span>{m.name}</span>
                        <span className="text-[9px] font-mono text-[#C98A2E] bg-[#C98A2E]/10 px-2 py-0.5 rounded-full border border-[#C98A2E]/20">{m.village_count || m.villageCount || 0} Villages</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {viewMode === 'mandal' && selectedMandal && (
              <div className="flex-grow flex flex-col overflow-hidden">
                <span className="text-xs text-[#F2F0E6]/50 mb-2 block font-medium">Select Village ({villagesList.length})</span>
                <div className="flex-grow overflow-y-auto max-h-[300px] pr-1 flex flex-col gap-1.5 custom-scroll">
                  {villagesList.length === 0 ? (
                    <div className="text-xs text-[#F2F0E6]/40 py-8 text-center animate-pulse">Loading Villages...</div>
                  ) : (
                    villagesList.map(v => {
                      const colorClass = v.riskLevel === 'LOW' ? 'text-green-400 border-green-500/20 bg-green-500/5' :
                                         v.riskLevel === 'MEDIUM' ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5' :
                                         'text-red-400 border-red-500/20 bg-red-500/5';
                      return (
                        <button
                          key={v.code}
                          onClick={() => navigate(`/public/village/${v.code}`)}
                          className="w-full text-left px-4 py-2.5 bg-[#16241D]/45 hover:bg-[#24382C]/60 border border-[#F2F0E6]/5 hover:border-[#C98A2E]/30 rounded-xl text-xs font-semibold text-[#F2F0E6] hover:text-[#C98A2E] transition-all flex justify-between items-center"
                        >
                          <span>{v.name}</span>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${colorClass}`}>{v.riskLevel || 'LOW'} RISK</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 6 — PUBLIC VILLAGE DASHBOARD PREVIEW */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 flex flex-col gap-5">
            <span className="text-xs font-mono font-bold tracking-widest text-[#C98A2E] uppercase">Immediate Access</span>
            <h2 className="font-heading text-4xl md:text-5xl text-white font-bold leading-tight">Public Village Dashboard</h2>
            <p className="text-sm text-[#F2F0E6]/70 leading-relaxed font-light">
              Every village has a live public dashboard accessible without authentication. See the overall development score, active government schemes, budgeted expenses, officials, and grievances with absolute transparency.
            </p>
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-[#C98A2E] shrink-0" />
                <span>Water Supply & Pipeline Analytics</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-[#C98A2E] shrink-0" />
                <span>Primary School Infrastructure Ratings</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-[#C98A2E] shrink-0" />
                <span>Health Clinics & Stock Supply Auditing</span>
              </div>
            </div>
          </div>

          {/* Preview Card */}
          <div className="lg:col-span-7 bg-[#24382C]/30 border border-[#F2F0E6]/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl glow-card">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-[#F2F0E6]/10 pb-6 mb-6">
              <div>
                <h3 className="font-heading font-extrabold text-2xl text-white">Ghatkesar Village</h3>
                <span className="text-xs font-mono text-[#F2F0E6]/60">LGD Code: 582490 • Medchal District</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-mono text-[#C98A2E] uppercase font-bold tracking-wider">Overall Score</span>
                <span className="text-3xl font-heading font-black text-white font-mono-num">87<span className="text-sm font-light text-[#F2F0E6]/60">/100</span></span>
              </div>
            </div>

            {/* Risk Indicator banner */}
            <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 px-4 py-2.5 rounded-xl mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                <span className="text-xs text-green-400 font-bold uppercase tracking-wider">AI Risk Level: LOW</span>
              </div>
              <span className="text-[10px] text-[#F2F0E6]/60 font-mono">Last Updated: Just Now</span>
            </div>

            {/* 5 Domain Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-[#16241D] border border-[#F2F0E6]/10 p-3 rounded-xl flex flex-col items-center text-center">
                <Droplet className="w-5 h-5 text-blue-400 mb-1" />
                <span className="text-[10px] font-mono uppercase text-[#F2F0E6]/50">Water</span>
                <span className="font-heading font-bold text-sm text-white mt-1">92/100</span>
                <span className="text-[9px] text-green-400 font-bold uppercase mt-1">LOW Risk</span>
              </div>
              <div className="bg-[#16241D] border border-[#F2F0E6]/10 p-3 rounded-xl flex flex-col items-center text-center">
                <GraduationCap className="w-5 h-5 text-indigo-400 mb-1" />
                <span className="text-[10px] font-mono uppercase text-[#F2F0E6]/50">Education</span>
                <span className="font-heading font-bold text-sm text-white mt-1">84/100</span>
                <span className="text-[9px] text-yellow-400 font-bold uppercase mt-1">MED Risk</span>
              </div>
              <div className="bg-[#16241D] border border-[#F2F0E6]/10 p-3 rounded-xl flex flex-col items-center text-center">
                <Activity className="w-5 h-5 text-red-400 mb-1" />
                <span className="text-[10px] font-mono uppercase text-[#F2F0E6]/50">Health</span>
                <span className="font-heading font-bold text-sm text-white mt-1">79/100</span>
                <span className="text-[9px] text-yellow-400 font-bold uppercase mt-1">MED Risk</span>
              </div>
              <div className="bg-[#16241D] border border-[#F2F0E6]/10 p-3 rounded-xl flex flex-col items-center text-center">
                <FileText className="w-5 h-5 text-orange-400 mb-1" />
                <span className="text-[10px] font-mono uppercase text-[#F2F0E6]/50">Agri</span>
                <span className="font-heading font-bold text-sm text-white mt-1">90/100</span>
                <span className="text-[9px] text-green-400 font-bold uppercase mt-1">LOW Risk</span>
              </div>
              <div className="bg-[#16241D] border border-[#F2F0E6]/10 p-3 rounded-xl flex flex-col items-center text-center col-span-2 md:col-span-1">
                <ShieldAlert className="w-5 h-5 text-yellow-400 mb-1" />
                <span className="text-[10px] font-mono uppercase text-[#F2F0E6]/50">Govern</span>
                <span className="font-heading font-bold text-sm text-white mt-1">88/100</span>
                <span className="text-[9px] text-green-400 font-bold uppercase mt-1">LOW Risk</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 7 — FEATURES */}
      <section id="features" className="py-24 px-6 bg-[#24382C]/30 border-t border-[#F2F0E6]/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center flex flex-col items-center gap-4 mb-16">
            <span className="text-xs font-mono font-bold tracking-widest text-[#C98A2E] uppercase">Core Capabilities</span>
            <h2 className="font-heading text-4xl md:text-5xl text-white font-bold leading-tight">GRAM Core Features</h2>
            <div className="w-16 h-1 bg-[#C98A2E]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            
            <div className="bg-[#16241D] border border-[#F2F0E6]/10 p-6 rounded-2xl flex flex-col gap-4 shadow-lg hover:border-[#C98A2E] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#C98A2E]/10 border border-[#C98A2E]/30 flex items-center justify-center text-[#C98A2E]">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-white">AI Risk Detection</h3>
              <p className="text-xs text-[#F2F0E6]/70 leading-relaxed">
                GRAM uses predictive models to spot construction delays, budget leaks, and lack of scheme disbursements before they criticalize.
              </p>
            </div>

            <div className="bg-[#16241D] border border-[#F2F0E6]/10 p-6 rounded-2xl flex flex-col gap-4 shadow-lg hover:border-[#C98A2E] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#C98A2E]/10 border border-[#C98A2E]/30 flex items-center justify-center text-[#C98A2E]">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-white">Village Development</h3>
              <p className="text-xs text-[#F2F0E6]/70 leading-relaxed">
                Interactive dashboards tracking infrastructure indicators, health indexes, water resources, and schooling variables.
              </p>
            </div>

            <div className="bg-[#16241D] border border-[#F2F0E6]/10 p-6 rounded-2xl flex flex-col gap-4 shadow-lg hover:border-[#C98A2E] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#C98A2E]/10 border border-[#C98A2E]/30 flex items-center justify-center text-[#C98A2E]">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-white">Budget Transparency</h3>
              <p className="text-xs text-[#F2F0E6]/70 leading-relaxed">
                Full breakdown of funds allocated vs. funds spent for each local project to prevent corruption and resource waste.
              </p>
            </div>

            <div className="bg-[#16241D] border border-[#F2F0E6]/10 p-6 rounded-2xl flex flex-col gap-4 shadow-lg hover:border-[#C98A2E] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#C98A2E]/10 border border-[#C98A2E]/30 flex items-center justify-center text-[#C98A2E]">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-white">Grievance Portal</h3>
              <p className="text-xs text-[#F2F0E6]/70 leading-relaxed">
                Citizens can directly log public issues. The system escalates them to officers and tracks resolution timelines automatically.
              </p>
            </div>

            <div className="bg-[#16241D] border border-[#F2F0E6]/10 p-6 rounded-2xl flex flex-col gap-4 shadow-lg hover:border-[#C98A2E] transition-colors col-span-1 md:col-span-3 lg:col-span-1">
              <div className="w-12 h-12 rounded-xl bg-[#C98A2E]/10 border border-[#C98A2E]/30 flex items-center justify-center text-[#C98A2E]">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-white">Scheme Audit</h3>
              <p className="text-xs text-[#F2F0E6]/70 leading-relaxed">
                Tracks state-welfare schemes (Rythu Bandhu, Dalit Bandhu, pensions) to ensure they target appropriate LGD parameters.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 7 — EVERY VILLAGE HAS A STORY */}
      <section id="story" className="py-24 px-6 max-w-7xl mx-auto border-t border-[#F2F0E6]/10">
        <div className="text-center flex flex-col items-center gap-4 mb-16">
          <span className="text-xs font-mono font-bold tracking-widest text-[#C98A2E] uppercase">Village-First Design</span>
          <h2 className="font-heading text-4xl md:text-5xl text-white font-bold leading-tight">Every Village Has a Story</h2>
          <div className="w-16 h-1 bg-[#C98A2E]" />
          <p className="text-sm text-[#F2F0E6]/70 max-w-2xl mt-2 font-light">
            Behind every LGD metric lies a real community. GRAM audits and visualizes 5 core sectors to convert raw village variables into targeted administrative support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Water Domain */}
          <div className="bg-[#24382C]/30 border border-[#F2F0E6]/10 p-6 rounded-2xl flex flex-col gap-4 shadow-lg hover:border-[#C98A2E] transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Droplet className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-white">Water Supply</h3>
            <p className="text-xs text-[#F2F0E6]/70 leading-relaxed font-light">
              Audits Mission Bhagiratha pipeline pressures, chlorination levels, overhead tanks, and community borewell status.
            </p>
            <div className="mt-auto pt-4 border-t border-[#F2F0E6]/5 text-[9px] font-mono text-[#C98A2E] uppercase tracking-wider">
              Data → AI Risk Anomaly
            </div>
          </div>

          {/* Education Domain */}
          <div className="bg-[#24382C]/30 border border-[#F2F0E6]/10 p-6 rounded-2xl flex flex-col gap-4 shadow-lg hover:border-[#C98A2E] transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-white">Schooling</h3>
            <p className="text-xs text-[#F2F0E6]/70 leading-relaxed font-light">
              Tracks government primary school classroom capacities, toilet sanitation, student-teacher ratios, and meal audits.
            </p>
            <div className="mt-auto pt-4 border-t border-[#F2F0E6]/5 text-[9px] font-mono text-[#C98A2E] uppercase tracking-wider">
              Data → Infrastructure Action
            </div>
          </div>

          {/* Health Domain */}
          <div className="bg-[#24382C]/30 border border-[#F2F0E6]/10 p-6 rounded-2xl flex flex-col gap-4 shadow-lg hover:border-[#C98A2E] transition-all">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-white">Health PHC</h3>
            <p className="text-xs text-[#F2F0E6]/70 leading-relaxed font-light">
              Monitors local Sub-Centre operations, medicine stock levels, vaccine availability, and doctor/nurse attendance records.
            </p>
            <div className="mt-auto pt-4 border-t border-[#F2F0E6]/5 text-[9px] font-mono text-[#C98A2E] uppercase tracking-wider">
              Data → Risk Detection
            </div>
          </div>

          {/* Agriculture Domain */}
          <div className="bg-[#24382C]/30 border border-[#F2F0E6]/10 p-6 rounded-2xl flex flex-col gap-4 shadow-lg hover:border-[#C98A2E] transition-all">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-white">Agriculture</h3>
            <p className="text-xs text-[#F2F0E6]/70 leading-relaxed font-light">
              Audits Rythu Bandhu disbursement speeds, local ground water table levels, crop yield predictions, and market yard rates.
            </p>
            <div className="mt-auto pt-4 border-t border-[#F2F0E6]/5 text-[9px] font-mono text-[#C98A2E] uppercase tracking-wider">
              Data → Farmers Support
            </div>
          </div>

          {/* Governance Domain */}
          <div className="bg-[#24382C]/30 border border-[#F2F0E6]/10 p-6 rounded-2xl flex flex-col gap-4 shadow-lg hover:border-[#C98A2E] transition-all">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-white">Governance</h3>
            <p className="text-xs text-[#F2F0E6]/70 leading-relaxed font-light">
              Measures panchayat administrative speeds, budget disclosures, and citizen grievance resolution timeline compliance.
            </p>
            <div className="mt-auto pt-4 border-t border-[#F2F0E6]/5 text-[9px] font-mono text-[#C98A2E] uppercase tracking-wider">
              Data → Public Audit
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8 — GOVERNANCE TRANSITION: FROM DATA TO ACTION */}
      <section className="py-24 px-6 bg-[#24382C]/30 border-y border-[#F2F0E6]/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,138,46,0.04),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center flex flex-col items-center gap-4 mb-16">
            <span className="text-xs font-mono font-bold tracking-widest text-[#C98A2E] uppercase">Governance Transition</span>
            <h2 className="font-heading text-4xl md:text-5xl text-white font-bold leading-tight">From Data to Action</h2>
            <div className="w-16 h-1 bg-[#C98A2E]" />
            <p className="text-sm text-[#F2F0E6]/70 max-w-xl mt-2 font-light">
              GRAM bridges the gap between field infrastructure and administrative decision-making in five clear steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center gap-4 z-10">
              <div className="w-16 h-16 rounded-full bg-[#16241D]/90 border border-[#F2F0E6]/15 hover:border-[#C98A2E] flex items-center justify-center font-heading text-xl font-bold text-[#C98A2E] shadow-lg transition-colors">
                1
              </div>
              <h4 className="font-heading text-base font-bold text-white uppercase tracking-wider">Ground Data</h4>
              <p className="text-[11px] text-[#F2F0E6]/60 leading-relaxed max-w-[180px] font-light">
                Sensors, registers, and citizen feedback generate continuous local status logs.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center gap-4 z-10">
              <div className="w-16 h-16 rounded-full bg-[#16241D]/90 border border-[#F2F0E6]/15 hover:border-[#C98A2E] flex items-center justify-center font-heading text-xl font-bold text-[#C98A2E] shadow-lg transition-colors">
                2
              </div>
              <h4 className="font-heading text-base font-bold text-white uppercase tracking-wider">AI Risk Engine</h4>
              <p className="text-[11px] text-[#F2F0E6]/60 leading-relaxed max-w-[180px] font-light">
                GRAM algorithms analyze data to predict project delays and resource deficits.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center gap-4 z-10">
              <div className="w-16 h-16 rounded-full bg-[#16241D]/90 border border-[#F2F0E6]/15 hover:border-[#C98A2E] flex items-center justify-center font-heading text-xl font-bold text-[#C98A2E] shadow-lg transition-colors">
                3
              </div>
              <h4 className="font-heading text-base font-bold text-white uppercase tracking-wider">Village Insight</h4>
              <p className="text-[11px] text-[#F2F0E6]/60 leading-relaxed max-w-[180px] font-light">
                Metrics are visualized instantly on public dashboards and administrative heatmaps.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center gap-4 z-10">
              <div className="w-16 h-16 rounded-full bg-[#16241D]/90 border border-[#F2F0E6]/15 hover:border-[#C98A2E] flex items-center justify-center font-heading text-xl font-bold text-[#C98A2E] shadow-lg transition-colors">
                4
              </div>
              <h4 className="font-heading text-base font-bold text-white uppercase tracking-wider">Official Action</h4>
              <p className="text-[11px] text-[#F2F0E6]/60 leading-relaxed max-w-[180px] font-light">
                Secretaries and Collectors review alerts and dispatch resources to resolve delays.
              </p>
            </div>

            {/* Step 5 */}
            <div className="flex flex-col items-center text-center gap-4 z-10">
              <div className="w-16 h-16 rounded-full bg-[#16241D]/90 border border-[#F2F0E6]/15 hover:border-[#C98A2E] flex items-center justify-center font-heading text-xl font-bold text-[#C98A2E] shadow-lg transition-colors">
                5
              </div>
              <h4 className="font-heading text-base font-bold text-white uppercase tracking-wider">Public Trust</h4>
              <p className="text-[11px] text-[#F2F0E6]/60 leading-relaxed max-w-[180px] font-light">
                Open, transparent loops build robust accountability for every Telangana citizen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9 — PUBLIC TRANSPARENCY: YOUR VILLAGE. YOUR INFORMATION. */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 flex flex-col gap-5">
            <span className="text-xs font-mono font-bold tracking-widest text-[#C98A2E] uppercase">Citizen Empowerment</span>
            <h2 className="font-heading text-4xl md:text-5xl text-white font-bold leading-tight">Your Village.<br />Your Information.</h2>
            <div className="w-16 h-1 bg-[#C98A2E]" />
            <p className="text-sm text-[#F2F0E6]/70 leading-relaxed font-light">
              Panchayat resources belong to the community. GRAM provides complete, unauthenticated access to village status scorecards, welfare allocations, officials directories, and grievance registers.
            </p>
            
            {/* Visual Guide Stepper */}
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex items-start gap-4">
                <span className="w-6 h-6 rounded-lg bg-[#C98A2E]/10 border border-[#C98A2E]/30 flex items-center justify-center font-mono text-[10px] font-bold text-[#C98A2E] shrink-0 mt-0.5">01</span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Select District</h4>
                  <p className="text-[11px] text-[#F2F0E6]/50">Navigate the State Map or directory to find your district.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="w-6 h-6 rounded-lg bg-[#C98A2E]/10 border border-[#C98A2E]/30 flex items-center justify-center font-mono text-[10px] font-bold text-[#C98A2E] shrink-0 mt-0.5">02</span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Select Mandal</h4>
                  <p className="text-[11px] text-[#F2F0E6]/50">Drill down into Mandal coordinates to list local villages.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="w-6 h-6 rounded-lg bg-[#C98A2E]/10 border border-[#C98A2E]/30 flex items-center justify-center font-mono text-[10px] font-bold text-[#C98A2E] shrink-0 mt-0.5">03</span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Inspect Scorecard</h4>
                  <p className="text-[11px] text-[#F2F0E6]/50">Inspect live scores, welfare budgets, and submit local grievances.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Live Preview Mockup */}
          <div className="lg:col-span-7 bg-[#24382C]/20 border border-[#F2F0E6]/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl glow-card">
            <div className="flex justify-between items-start border-b border-[#F2F0E6]/10 pb-6 mb-6">
              <div>
                <h3 className="font-heading font-extrabold text-2xl text-white">Ankapur Village</h3>
                <span className="text-xs font-mono text-[#F2F0E6]/60">LGD Code: 569005 • Nizamabad District</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-mono text-[#C98A2E] uppercase font-bold tracking-wider">Overall Score</span>
                <span className="text-3xl font-heading font-black text-white font-mono-num">89<span className="text-sm font-light text-[#F2F0E6]/60">/100</span></span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 px-4 py-2.5 rounded-xl mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                <span className="text-xs text-green-400 font-bold uppercase tracking-wider">AI Risk Level: LOW</span>
              </div>
              <span className="text-[10px] text-[#F2F0E6]/60 font-mono">Last Audited: Just Now</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-[#16241D]/90 border border-[#F2F0E6]/5 p-3 rounded-xl flex flex-col items-center text-center">
                <Droplet className="w-5 h-5 text-blue-400 mb-1" />
                <span className="text-[9px] font-mono uppercase text-[#F2F0E6]/50">Water</span>
                <span className="font-heading font-bold text-sm text-white mt-1">94</span>
                <span className="text-[8px] text-green-400 font-bold uppercase mt-1">LOW Risk</span>
              </div>
              <div className="bg-[#16241D]/90 border border-[#F2F0E6]/5 p-3 rounded-xl flex flex-col items-center text-center">
                <GraduationCap className="w-5 h-5 text-indigo-400 mb-1" />
                <span className="text-[9px] font-mono uppercase text-[#F2F0E6]/50">Schooling</span>
                <span className="font-heading font-bold text-sm text-white mt-1">88</span>
                <span className="text-[8px] text-green-400 font-bold uppercase mt-1">LOW Risk</span>
              </div>
              <div className="bg-[#16241D]/90 border border-[#F2F0E6]/5 p-3 rounded-xl flex flex-col items-center text-center">
                <Activity className="w-5 h-5 text-red-400 mb-1" />
                <span className="text-[9px] font-mono uppercase text-[#F2F0E6]/50">Health</span>
                <span className="font-heading font-bold text-sm text-white mt-1">81</span>
                <span className="text-[8px] text-yellow-400 font-bold uppercase mt-1">MED Risk</span>
              </div>
              <div className="bg-[#16241D]/90 border border-[#F2F0E6]/5 p-3 rounded-xl flex flex-col items-center text-center">
                <Sprout className="w-5 h-5 text-green-400 mb-1" />
                <span className="text-[9px] font-mono uppercase text-[#F2F0E6]/50">Agri</span>
                <span className="font-heading font-bold text-sm text-white mt-1">92</span>
                <span className="text-[8px] text-green-400 font-bold uppercase mt-1">LOW Risk</span>
              </div>
              <div className="bg-[#16241D]/90 border border-[#F2F0E6]/5 p-3 rounded-xl flex flex-col items-center text-center col-span-2 md:col-span-1">
                <ShieldAlert className="w-5 h-5 text-yellow-400 mb-1" />
                <span className="text-[9px] font-mono uppercase text-[#F2F0E6]/50">Govern</span>
                <span className="font-heading font-bold text-sm text-white mt-1">90</span>
                <span className="text-[8px] text-green-400 font-bold uppercase mt-1">LOW Risk</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 10 — OFFICIAL GOVERNANCE: FROM VILLAGE TO DISTRICT */}
      <section className="py-24 px-6 bg-[#24382C]/30 border-t border-[#F2F0E6]/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Visual Scope Hierarchy Diagram */}
          <div className="lg:col-span-7 grid grid-cols-1 gap-4">
            {/* Village Scope Card */}
            <div className="bg-[#16241D] border border-[#F2F0E6]/10 p-5 rounded-2xl flex items-center gap-5 shadow-md">
              <div className="w-12 h-12 rounded-xl bg-[#C98A2E]/10 border border-[#C98A2E]/30 flex items-center justify-center font-heading text-lg font-bold text-[#C98A2E]">01</div>
              <div className="flex flex-col">
                <h4 className="font-heading text-base font-bold text-white">Village Officer (Sarpanch / Secretary)</h4>
                <p className="text-xs text-[#F2F0E6]/60 leading-relaxed font-light mt-0.5">
                  Detailed view of local complaints, pipeline sensors, and specific school construction registers.
                </p>
              </div>
            </div>

            {/* Mandal Scope Card */}
            <div className="bg-[#16241D] border border-[#F2F0E6]/10 p-5 rounded-2xl flex items-center gap-5 shadow-md">
              <div className="w-12 h-12 rounded-xl bg-[#C98A2E]/10 border border-[#C98A2E]/30 flex items-center justify-center font-heading text-lg font-bold text-[#C98A2E]">02</div>
              <div className="flex flex-col">
                <h4 className="font-heading text-base font-bold text-white">Mandal Administration (Tahsildar / MPDO)</h4>
                <p className="text-xs text-[#F2F0E6]/60 leading-relaxed font-light mt-0.5">
                  Aggregated dashboard of all constituent villages, flagging regional supply bottlenecks.
                </p>
              </div>
            </div>

            {/* District Scope Card */}
            <div className="bg-[#16241D] border border-[#F2F0E6]/10 p-5 rounded-2xl flex items-center gap-5 shadow-md">
              <div className="w-12 h-12 rounded-xl bg-[#C98A2E]/10 border border-[#C98A2E]/30 flex items-center justify-center font-heading text-lg font-bold text-[#C98A2E]">03</div>
              <div className="flex flex-col">
                <h4 className="font-heading text-base font-bold text-white">District Collector</h4>
                <p className="text-xs text-[#F2F0E6]/60 leading-relaxed font-light mt-0.5">
                  High-level heatmaps monitoring mandal performance indexes, delayed projects, and budget overruns.
                </p>
              </div>
            </div>

            {/* State Scope Card */}
            <div className="bg-[#16241D] border border-[#F2F0E6]/10 p-5 rounded-2xl flex items-center gap-5 shadow-md border-dashed border-[#C98A2E]/40">
              <div className="w-12 h-12 rounded-xl bg-[#C98A2E]/10 border border-[#C98A2E]/30 flex items-center justify-center font-heading text-lg font-bold text-[#C98A2E]">04</div>
              <div className="flex flex-col">
                <h4 className="font-heading text-base font-bold text-white">State Governance (Ministers / Directors)</h4>
                <p className="text-xs text-[#F2F0E6]/60 leading-relaxed font-light mt-0.5">
                  Macro trends showing statewide fund allocations, citizen grievance response speeds, and welfare audit metrics.
                </p>
              </div>
            </div>
          </div>

          {/* Description Column */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <span className="text-xs font-mono font-bold tracking-widest text-[#C98A2E] uppercase">Scope-Based Access</span>
            <h2 className="font-heading text-4xl md:text-5xl text-white font-bold leading-tight">From Village<br />to District</h2>
            <div className="w-16 h-1 bg-[#C98A2E]" />
            <p className="text-sm text-[#F2F0E6]/70 leading-relaxed font-light">
              GRAM secures governance boundaries dynamically. Local officers act on village detail registers, while Mandal, District, and State executives see consolidated, risk-weighted analytics according to their administrative level.
            </p>
            <div className="mt-2">
              <button 
                onClick={() => navigate('/login')}
                className="bg-[#C98A2E] hover:bg-[#b07824] text-[#16241D] font-bold text-xs font-mono px-6 py-3.5 rounded-xl transition-all"
              >
                Access Administration Gate
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 10 — LOGIN PORTALS */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center flex flex-col items-center gap-4 mb-16">
          <span className="text-xs font-mono font-bold tracking-widest text-[#C98A2E] uppercase">Access Gates</span>
          <h2 className="font-heading text-4xl md:text-5xl text-white font-bold leading-tight">Officer & Admin Portals</h2>
          <div className="w-16 h-1 bg-[#C98A2E]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="bg-[#24382C]/30 border border-[#F2F0E6]/10 p-6 rounded-2xl flex flex-col gap-4 shadow-lg justify-between h-[250px]">
            <div className="flex flex-col gap-2">
              <span className="text-[#C98A2E] font-mono font-bold text-xs uppercase tracking-wider">Citizen</span>
              <h3 className="font-heading text-xl font-bold text-white">View Village</h3>
              <p className="text-xs text-[#F2F0E6]/60 leading-relaxed">
                Free open portal to review development scores, budget transparency, and file grievances.
              </p>
            </div>
            <button 
              onClick={() => {
                const sec = document.getElementById('explore');
                if (sec) sec.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-[#C98A2E] font-bold text-xs font-mono flex items-center gap-1 group hover:underline"
            >
              Explore Map <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="bg-[#24382C]/30 border border-[#F2F0E6]/10 p-6 rounded-2xl flex flex-col gap-4 shadow-lg justify-between h-[250px]">
            <div className="flex flex-col gap-2">
              <span className="text-[#C98A2E] font-mono font-bold text-xs uppercase tracking-wider">Panchayat</span>
              <h3 className="font-heading text-xl font-bold text-white">Manage Village</h3>
              <p className="text-xs text-[#F2F0E6]/60 leading-relaxed">
                Panchayat secretaries can update project progress, update budgets, and resolve grievances.
              </p>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="text-[#C98A2E] font-bold text-xs font-mono flex items-center gap-1 group hover:underline"
            >
              Portal Login <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="bg-[#24382C]/30 border border-[#F2F0E6]/10 p-6 rounded-2xl flex flex-col gap-4 shadow-lg justify-between h-[250px]">
            <div className="flex flex-col gap-2">
              <span className="text-[#C98A2E] font-mono font-bold text-xs uppercase tracking-wider">Collector</span>
              <h3 className="font-heading text-xl font-bold text-white">District Dashboard</h3>
              <p className="text-xs text-[#F2F0E6]/60 leading-relaxed">
                Administrators can monitor all mandals, villages, and check overall risk alerts.
              </p>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="text-[#C98A2E] font-bold text-xs font-mono flex items-center gap-1 group hover:underline"
            >
              Portal Login <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="bg-[#24382C]/30 border border-[#F2F0E6]/10 p-6 rounded-2xl flex flex-col gap-4 shadow-lg justify-between h-[250px]">
            <div className="flex flex-col gap-2">
              <span className="text-[#C98A2E] font-mono font-bold text-xs uppercase tracking-wider">State Admin</span>
              <h3 className="font-heading text-xl font-bold text-white">State Analytics</h3>
              <p className="text-xs text-[#F2F0E6]/60 leading-relaxed">
                State ministers and directors review macro stats, budget utilization, and district indexes.
              </p>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="text-[#C98A2E] font-bold text-xs font-mono flex items-center gap-1 group hover:underline"
            >
              Portal Login <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </section>

      {/* SECTION 11 — FOOTER */}
      <footer className="bg-[#16241D] border-t border-[#F2F0E6]/10 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
          
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#C98A2E] rounded-xl flex items-center justify-center">
                <span className="font-heading font-black text-xl text-[#16241D]">G</span>
              </div>
              <span className="font-heading font-extrabold text-xl text-white">GRAM</span>
            </div>
            <p className="text-xs text-[#F2F0E6]/60 leading-relaxed max-w-sm">
              GRAM (Governance Risk & Accountability Monitor) is a digital platform designed for statewide deployment in Telangana, promoting village accountability, budget transparency, and AI-led risk audit operations.
            </p>
            <span className="text-[10px] text-[#F2F0E6]/40 font-mono mt-2 block">
              © 2026 GRAM Telangana Government. LGD Directory Compliant.
            </span>
          </div>

          <div className="md:col-span-2 flex flex-col gap-4">
            <h4 className="text-xs font-mono font-bold text-[#C98A2E] uppercase tracking-wider">Portals</h4>
            <div className="flex flex-col gap-2 text-xs text-[#F2F0E6]/70">
              <a href="#explore" className="hover:text-white transition-colors">Explore Map</a>
              <a href="/login" className="hover:text-white transition-colors">Officer Login</a>
              <a href="/login" className="hover:text-white transition-colors">Admin Console</a>
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col gap-4">
            <h4 className="text-xs font-mono font-bold text-[#C98A2E] uppercase tracking-wider">Resources</h4>
            <div className="flex flex-col gap-2 text-xs text-[#F2F0E6]/70">
              <a href="#about" className="hover:text-white transition-colors">About Mission</a>
              <a href="#" className="hover:text-white transition-colors">LGD Directory</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>

          <div className="md:col-span-3 flex flex-col gap-4">
            <h4 className="text-xs font-mono font-bold text-[#C98A2E] uppercase tracking-wider">Developer & Source</h4>
            <p className="text-xs text-[#F2F0E6]/60 leading-relaxed">
              GRAM Telangana is built as an open governance standard. Review the source code and GIS mapping modules on GitHub.
            </p>
            <a 
              href="https://github.com/sanny1724/MINI-PROJECT-GRAM" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs text-[#F2F0E6] hover:text-[#C98A2E] transition-colors border border-[#F2F0E6]/10 px-4 py-2 rounded-lg w-max mt-2"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              Source on GitHub
            </a>
          </div>

        </div>
      </footer>

    </div>
  );
}
