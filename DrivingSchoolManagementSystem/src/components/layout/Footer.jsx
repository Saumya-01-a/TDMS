import "./layout.css";
import { Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer bg-slate-950 border-t border-white/10 pt-20 pb-16">
      {/* Centered Symmetric Container */}
      <div className="max-w-7xl mx-auto px-10">
        
        {/* Balanced 4-Column Grid System */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 items-start">
          
          {/* Column 1: Brand Identity */}
          <div className="flex flex-col gap-6 font-sans">
            <div className="flex flex-col">
              <h2 className="text-white text-2xl font-black italic tracking-tighter leading-none">
                THISARA <span className="text-[#E11B22]">DRIVING</span>
              </h2>
              <h2 className="text-white text-2xl font-black italic tracking-tighter mt-1 leading-none">
                SCHOOL
              </h2>
            </div>
            <p className="text-[#E11B22] text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed">
              Safety & Defensive <br /> Driving Training
            </p>
          </div>

          {/* Column 2: Discover */}
          <div className="flex flex-col gap-8">
            <h3 className="text-white text-sm font-bold uppercase tracking-[0.2em] border-l-2 border-[#E11B22] pl-4">
              Discover
            </h3>
            <ul className="flex flex-col gap-4">
              <li><a href="#home" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Home</a></li>
              <li><a href="#about" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">About Us</a></li>
              <li><a href="#services" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Services</a></li>
              <li><a href="#contact" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Contact Us</a></li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div className="flex flex-col gap-8">
            <h3 className="text-white text-sm font-bold uppercase tracking-[0.2em] border-l-2 border-[#E11B22] pl-4">
              Services
            </h3>
            <ul className="flex flex-col gap-4 text-sm font-medium">
              <li className="text-slate-400">Motor Bike</li>
              <li className="text-slate-400">Three Wheel</li>
              <li className="text-slate-400">Light Vehicle</li>
              <li className="text-slate-400">Heavy & Automotive</li>
            </ul>
          </div>

          {/* Column 4: Follow Us */}
          <div className="flex flex-col gap-8">
            <h3 className="text-white text-sm font-bold uppercase tracking-[0.2em] border-l-2 border-[#E11B22] pl-4">
              Follow Us
            </h3>
            <div className="flex gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#E11B22] transition-all p-3 bg-white/5 rounded-xl border border-white/5 hover:border-[#E11B22]/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#E11B22] transition-all p-3 bg-white/5 rounded-xl border border-white/5 hover:border-[#E11B22]/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#E11B22] transition-all p-3 bg-white/5 rounded-xl border border-white/5 hover:border-[#E11B22]/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Separated Bottom Contact Bar */}
        <div className="mt-20 pt-12 border-t border-white/5">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10 bg-black/60 border border-white/5 rounded-3xl px-12 py-8 shadow-2xl">
            {/* Unified Contact Info */}
            <div className="flex flex-col md:flex-row items-center gap-x-16 gap-y-6">
              <div className="flex items-center gap-4 group">
                <div className="p-2 bg-[#E11B22]/10 rounded-lg group-hover:bg-[#E11B22]/20 transition-colors">
                  <Phone className="text-[#E11B22]" size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-sm font-bold tracking-wider">+94 777 47 00 48</span>
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Hotline</span>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="p-2 bg-[#E11B22]/10 rounded-lg group-hover:bg-[#E11B22]/20 transition-colors">
                  <Phone className="text-[#E11B22]" size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-sm font-bold tracking-wider">+94 33 229 73 25</span>
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Office</span>
                </div>
              </div>
              <div className="flex items-center gap-4 group border-l md:border-white/10 md:pl-16">
                <div className="p-2 bg-[#E11B22]/10 rounded-lg group-hover:bg-[#E11B22]/20 transition-colors">
                  <Mail className="text-[#E11B22]" size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-sm font-bold tracking-wider italic">thisaradrivingschool1@gmail.com</span>
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Official Email</span>
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-full border border-white/10">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-[#E11B22]"></div>
                <div className="absolute top-0 w-2.5 h-2.5 rounded-full bg-[#E11B22] animate-ping"></div>
              </div>
              <p className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
                Registered School
              </p>
            </div>
          </div>

          {/* Copyright & Legal Row */}
          <div className="mt-12 text-center pb-4">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] opacity-50">
              © 2026 Thisara Driving School <span className="mx-3 text-[#E11B22]">•</span> Established Safety Since 2000
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
