import React, { useState, useEffect } from 'react';
import { io } from "socket.io-client";

const PricingPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPackages = async () => {
    try {
      // Use the public instructor packages endpoint which already exists
      const res = await fetch('http://localhost:3000/instructor/packages');
      const data = await res.json();
      if (data.ok) {
        // Filter to only show Active packages and exclude 'Mega Van Pack'
        setPackages(data.packages.filter(p => 
          p.status === 'Active' && p.name !== 'Mega Van Pack'
        ));
      }
    } catch (err) {
      console.error("Pricing Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();

    // Listen for real-time updates from Admin Dashboard
    const socket = io("http://localhost:3000");
    socket.on("package_update", () => {
      console.log("🔄 Real-time package update received");
      fetchPackages();
    });

    return () => socket.disconnect();
  }, []);

  if (loading) return null; // Or a subtle skeleton

  return (
    <div className="w-full py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <div 
              key={pkg.id || index}
              className="group p-8 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 transition-all duration-300 hover:border-[#ff4d4d] hover:shadow-[0_0_20px_rgba(255,77,77,0.3)] hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-4 group-hover:text-white transition-colors">
                  {pkg.name}
                </h3>
                <div className="w-12 h-1 bg-[#ff4d4d] rounded-full mb-6 transition-all duration-300 group-hover:w-full opacity-50"></div>
                <p className="text-slate-400 text-sm mb-6 line-clamp-3">
                  {pkg.description || "Comprehensive driving training with expert instructors."}
                </p>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm text-slate-400 uppercase tracking-wider mb-1">
                  Investment
                </span>
                <p className="text-3xl md:text-4xl font-bold text-[#ff4d4d]">
                  {parseFloat(pkg.price).toLocaleString()} <span className="text-lg font-medium opacity-80">LKR</span>
                </p>
                <button className="mt-8 py-3 px-6 rounded-xl bg-white/5 border border-white/10 text-white font-semibold transition-all duration-300 hover:bg-[#ff4d4d] hover:border-[#ff4d4d] hover:text-white">
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPackages;
