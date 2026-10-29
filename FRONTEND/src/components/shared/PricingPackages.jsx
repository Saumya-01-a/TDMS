import React, { useState, useEffect } from 'react';
import { io } from "socket.io-client";
import { CheckCircle2, Sparkles, ArrowRight, Car, Bike, Layers } from 'lucide-react';

const FALLBACK_PACKAGES = [
  {
    id: 1,
    name: "Motorcycle",
    price: 6020,
    description: "Comprehensive motorcycle agility, clutch control, slalom handling, and complete trial track guidance.",
    category: "single"
  },
  {
    id: 2,
    name: "Three wheel",
    price: 7500,
    description: "Safe handling of three-wheel vehicles, sharp cornering control, incline braking, and urban road etiquette.",
    category: "single"
  },
  {
    id: 3,
    name: "Three wheeler + Motorcycle",
    price: 12000,
    description: "Compact dual training combo covering both light commercial auto-rickshaws and geared/automatic motorbikes.",
    category: "combo"
  },
  {
    id: 4,
    name: "Car (auto)",
    price: 15000,
    description: "Dual-pedal training in modern sedans with complete mastery of hill starts, parallel parking, and busy traffic.",
    category: "single",
    isPopular: true
  },
  {
    id: 5,
    name: "Car + Three wheeler",
    price: 20000,
    description: "Combined dual-vehicle mastery designed for versatile personal transport and commercial driving confidence.",
    category: "combo"
  },
  {
    id: 6,
    name: "Van + Motorcycle",
    price: 25000,
    description: "Specialized passenger van maneuvering combined with complete motorcycle license certification.",
    category: "combo"
  },
  {
    id: 7,
    name: "Van + Three wheeler + Motorcycle",
    price: 35000,
    description: "All-in-one comprehensive commercial & personal fleet qualification with dedicated one-on-one sessions.",
    category: "combo"
  }
];

const getPackageFeatures = (name) => {
  const n = name.toLowerCase();
  if (n.includes('car') && (n.includes('+') || n.includes('three') || n.includes('van'))) {
    return [
      "Multi-category license in a single program",
      "Modern dual-controlled sedan & fleet vehicles",
      "Complete RMV trial exam assistance for all classes",
      "Flexible weekend & evening scheduling slots"
    ];
  }
  if (n.includes('car')) {
    return [
      "Dual-pedal passenger safety override system",
      "Parallel parking, hill start & reverse bay drills",
      "Highway driving & busy urban traffic mastery",
      "Trial day exam vehicle rental included"
    ];
  }
  if (n.includes('van')) {
    return [
      "Extended wheelbase & blind spot management",
      "Commercial passenger safety guidelines",
      "Mock trial tests on official practice grounds",
      "Trial day exam vehicle provided"
    ];
  }
  if (n.includes('motorcycle') && n.includes('three')) {
    return [
      "Dual license certification (Class A/B & Three Wheel)",
      "Slalom, balance & emergency braking practice",
      "Dedicated trial circuit practice track access",
      "Comprehensive highway code & theory prep"
    ];
  }
  if (n.includes('motorcycle')) {
    return [
      "Clutch control & automatic scooter drills",
      "Slalom & figure-8 trial practice grounds",
      "Certified helmets & protective safety gear",
      "Written theory exam prep & mock trials"
    ];
  }
  if (n.includes('three')) {
    return [
      "Incline stopping & hand-throttle mastery",
      "Reversing & tight city cornering techniques",
      "Official RMV trial circuit preparation",
      "Complete guidance on learner permit paperwork"
    ];
  }
  return [
    "Government certified instructor sessions",
    "Modern dual-controlled fleet vehicle",
    "Complete RMV trial exam assistance",
    "Flexible scheduling (weekdays/weekends)"
  ];
};

const getCategoryBadge = (name) => {
  const n = name.toLowerCase();
  if (n.includes('+')) return { label: "Combo Package", icon: Layers };
  if (n.includes('car')) return { label: "Light Vehicle", icon: Car };
  if (n.includes('motorcycle')) return { label: "Motorbike", icon: Bike };
  return { label: "Single Class", icon: Car };
};

const PricingPackages = () => {
  const [packages, setPackages] = useState(FALLBACK_PACKAGES);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchPackages = async () => {
    try {
      const res = await fetch('http://localhost:3000/instructor/packages');
      const data = await res.json();
      if (data.ok && Array.isArray(data.packages) && data.packages.length > 0) {
        const active = data.packages.filter(p => 
          p.status === 'Active' && p.name !== 'Mega Van Pack'
        );
        if (active.length > 0) {
          setPackages(active);
        }
      }
    } catch (err) {
      console.log("Using cached pricing packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();

    const socket = io("http://localhost:3000", { autoConnect: false });
    socket.connect();
    socket.on("package_update", () => {
      fetchPackages();
    });

    return () => socket.disconnect();
  }, []);

  const filteredPackages = packages.filter(pkg => {
    const isCombo = pkg.name.includes('+');
    if (selectedFilter === 'single') return !isCombo;
    if (selectedFilter === 'combo') return isCombo;
    return true;
  });

  return (
    <div className="w-full">
      {/* 1. Category Filter Tabs - Bottom Margin: 36px to prevent overlapping cards */}
      <div 
        className="flex items-center justify-center gap-3 flex-wrap"
        style={{ marginBottom: "36px" }}
      >
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            selectedFilter === 'all'
              ? 'bg-[#E11B22] text-white shadow-lg shadow-red-600/30 scale-105'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
          }`}
        >
          All Packages ({packages.length})
        </button>
        <button
          onClick={() => setSelectedFilter('single')}
          className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            selectedFilter === 'single'
              ? 'bg-[#E11B22] text-white shadow-lg shadow-red-600/30 scale-105'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
          }`}
        >
          Single Vehicles
        </button>
        <button
          onClick={() => setSelectedFilter('combo')}
          className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            selectedFilter === 'combo'
              ? 'bg-[#E11B22] text-white shadow-lg shadow-red-600/30 scale-105'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
          }`}
        >
          Multi-Vehicle Combos
        </button>
      </div>

      {/* 2. Symmetric Grid - 32px Grid Gap & Centered Trailing Cards */}
      <div 
        className="flex flex-wrap justify-center items-stretch"
        style={{ gap: "32px" }}
      >
        {filteredPackages.map((pkg, index) => {
          const isFeatured = pkg.isPopular || pkg.name.toLowerCase().includes('car (auto)');
          const features = pkg.features || getPackageFeatures(pkg.name);
          const badge = getCategoryBadge(pkg.name);
          const BadgeIcon = badge.icon;

          return (
            <div 
              key={pkg.id || index}
              className={`w-full md:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)] min-w-[280px] max-w-[390px] relative group rounded-2xl flex flex-col justify-between transition-all duration-300 ${
                isFeatured 
                  ? 'bg-gradient-to-b from-[#112240] to-[#0a192f] border-2 border-[#E11B22] shadow-[0_15px_40px_rgba(225,27,34,0.25)] -translate-y-2' 
                  : 'bg-slate-900/60 backdrop-blur-md border border-white/10 hover:border-[#E11B22]/60 hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)] hover:-translate-y-1.5'
              }`}
              style={{
                padding: isFeatured ? "38px 28px 28px 28px" : "28px",
                boxSizing: "border-box"
              }}
            >
              {/* Featured Badge with ample top clearance */}
              {isFeatured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#E11B22] text-white text-[11px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap z-10">
                  <Sparkles className="w-3.5 h-3.5" />
                  Most Popular Choice
                </div>
              )}

              {/* Card Header & Content */}
              <div>
                {/* Category Chip */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold">
                    <BadgeIcon className="w-3.5 h-3.5 text-[#E11B22]" />
                    {badge.label}
                  </span>
                </div>

                <h3 className="text-xl lg:text-2xl font-extrabold text-white group-hover:text-red-400 transition-colors font-heading capitalize mb-2.5">
                  {pkg.name}
                </h3>
                
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 min-h-[40px]">
                  {pkg.description || "Comprehensive driving training with expert certified instructors."}
                </p>

                <div className="w-full h-px bg-white/10 mb-6"></div>

                {/* Features List - Line Height 1.6 & Margin Bottom 12px */}
                <ul className="mb-8" style={{ listStyle: "none", padding: 0 }}>
                  {features.map((feat, i) => (
                    <li 
                      key={i} 
                      className="flex items-start gap-3 text-xs sm:text-sm text-slate-300 font-medium"
                      style={{ 
                        lineHeight: "1.6", 
                        marginBottom: i === features.length - 1 ? "0px" : "12px" 
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#E11B22] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Card Footer / Price & Button */}
              <div className="pt-6 border-t border-white/10 flex flex-col mt-auto">
                <span className="text-[11px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                  Tuition Fee
                </span>
                
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl lg:text-4xl font-black text-white font-heading tracking-tight">
                    {parseFloat(pkg.price).toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-red-500 uppercase tracking-wider">
                    LKR
                  </span>
                </div>

                <a 
                  href="/register" 
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-center flex items-center justify-center gap-2 transition-all duration-300 text-sm cursor-pointer ${
                    isFeatured 
                      ? 'bg-[#E11B22] text-white hover:bg-[#c4141b] shadow-lg shadow-red-600/30 hover:scale-[1.02]' 
                      : 'bg-white/10 hover:bg-[#E11B22] text-white border border-white/15 hover:border-[#E11B22] shadow-sm hover:shadow-lg hover:scale-[1.02]'
                  }`}
                >
                  <span>Enroll In Package</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PricingPackages;
