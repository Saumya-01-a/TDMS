import "./layout.css";
import { Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer bg-slate-950 border-t border-white/10 pt-20 pb-16">
      {/* Centered Symmetric Container with Inner Padding (24px 40px) */}
      <div 
        className="footer-inner-container max-w-7xl mx-auto"
        style={{ padding: "24px 40px" }}
      >
        
        {/* Balanced 4-Column Grid System with Proper Gaps */}
        <div className="footer-grid-columns">
          
          {/* Column 1: Brand Identity */}
          <div className="flex flex-col gap-5 font-sans">
            <div className="flex flex-col">
              <h2 className="text-white text-2xl font-black italic tracking-tighter leading-none font-heading">
                THISARA <span className="text-[#E11B22]">DRIVING</span>
              </h2>
              <h2 className="text-white text-2xl font-black italic tracking-tighter mt-1 leading-none font-heading">
                SCHOOL
              </h2>
            </div>
            <p className="text-[#E11B22] text-[10px] font-black uppercase tracking-[0.28em] leading-relaxed">
              Safety & Defensive <br /> Driving Training
            </p>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
              Sri Lanka's certified driver training academy dedicated to safety, defensive road skills, and first-time exam success.
            </p>
          </div>

          {/* Column 2: Discover */}
          <div className="flex flex-col gap-6">
            <h3 className="text-white text-sm font-bold uppercase tracking-[0.2em] border-l-2 border-[#E11B22] pl-3.5">
              Discover
            </h3>
            <ul className="flex flex-col gap-3.5">
              <li><a href="#home" className="text-slate-400 hover:text-white hover:text-[#ff4d4d] transition-colors text-sm font-medium">Home</a></li>
              <li><a href="#about" className="text-slate-400 hover:text-white hover:text-[#ff4d4d] transition-colors text-sm font-medium">About Us</a></li>
              <li><a href="#services" className="text-slate-400 hover:text-white hover:text-[#ff4d4d] transition-colors text-sm font-medium">Services & Fleet</a></li>
              <li><a href="#pricing" className="text-slate-400 hover:text-white hover:text-[#ff4d4d] transition-colors text-sm font-medium">Pricing Packages</a></li>
              <li><a href="#contact" className="text-slate-400 hover:text-white hover:text-[#ff4d4d] transition-colors text-sm font-medium">Contact Us</a></li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div className="flex flex-col gap-6">
            <h3 className="text-white text-sm font-bold uppercase tracking-[0.2em] border-l-2 border-[#E11B22] pl-3.5">
              Services
            </h3>
            <ul className="flex flex-col gap-3.5 text-sm font-medium">
              <li><a href="#services" className="text-slate-400 hover:text-white transition-colors">Motor Bike</a></li>
              <li><a href="#services" className="text-slate-400 hover:text-white transition-colors">Three Wheel</a></li>
              <li><a href="#services" className="text-slate-400 hover:text-white transition-colors">Light Vehicle</a></li>
              <li><a href="#services" className="text-slate-400 hover:text-white transition-colors">Heavy & Automotive</a></li>
              <li><a href="#services" className="text-slate-400 hover:text-white transition-colors">Theory Preparation</a></li>
            </ul>
          </div>

          {/* Column 4: Follow Us */}
          <div className="flex flex-col gap-6">
            <h3 className="text-white text-sm font-bold uppercase tracking-[0.2em] border-l-2 border-[#E11B22] pl-3.5">
              Follow Us
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Stay updated with trial test tips, road safety regulations, and announcements.
            </p>
            <div className="flex gap-3 mt-1">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-400 hover:text-[#E11B22] transition-all p-3 bg-white/5 rounded-xl border border-white/10 hover:border-[#E11B22]/40 hover:scale-105"
                aria-label="Facebook"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-400 hover:text-[#E11B22] transition-all p-3 bg-white/5 rounded-xl border border-white/10 hover:border-[#E11B22]/40 hover:scale-105"
                aria-label="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-400 hover:text-[#E11B22] transition-all p-3 bg-white/5 rounded-xl border border-white/10 hover:border-[#E11B22]/40 hover:scale-105"
                aria-label="YouTube"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Separated Bottom Contact Bar with Inner Padding (14px 28px) */}
        <div className="mt-16 pt-10 border-t border-white/10">
          <div 
            className="footer-contact-bar"
            style={{ padding: "14px 28px" }}
          >
            {/* Unified Contact Info */}
            <div className="flex flex-wrap items-center gap-x-12 gap-y-4">
              
              {/* Hotline */}
              <a href="tel:+94777470048" className="flex items-center gap-3.5 group text-decoration-none">
                <div className="p-2.5 bg-[#E11B22]/15 border border-[#E11B22]/30 rounded-xl group-hover:bg-[#E11B22] transition-all shrink-0">
                  <Phone className="text-[#E11B22] group-hover:text-white transition-colors" size={17} />
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-sm font-bold tracking-wider group-hover:text-red-400 transition-colors">+94 777 47 00 48</span>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Hotline</span>
                </div>
              </a>

              {/* Office */}
              <a href="tel:+94332297325" className="flex items-center gap-3.5 group text-decoration-none">
                <div className="p-2.5 bg-[#E11B22]/15 border border-[#E11B22]/30 rounded-xl group-hover:bg-[#E11B22] transition-all shrink-0">
                  <Phone className="text-[#E11B22] group-hover:text-white transition-colors" size={17} />
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-sm font-bold tracking-wider group-hover:text-red-400 transition-colors">+94 33 229 73 25</span>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Office</span>
                </div>
              </a>

              {/* Email */}
              <a href="mailto:thisaradrivingschool1@gmail.com" className="flex items-center gap-3.5 group text-decoration-none md:border-l md:border-white/10 md:pl-10">
                <div className="p-2.5 bg-[#E11B22]/15 border border-[#E11B22]/30 rounded-xl group-hover:bg-[#E11B22] transition-all shrink-0">
                  <Mail className="text-[#E11B22] group-hover:text-white transition-colors" size={17} />
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-sm font-bold tracking-wider italic group-hover:text-red-400 transition-colors">thisaradrivingschool1@gmail.com</span>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Official Email</span>
                </div>
              </a>

            </div>

            {/* Status Indicator Badge */}
            <div className="flex items-center gap-3 bg-white/5 px-5 py-2 rounded-full border border-white/15 shrink-0">
              <div className="relative flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#E11B22]"></div>
                <div className="absolute w-2.5 h-2.5 rounded-full bg-[#E11B22] animate-ping opacity-75"></div>
              </div>
              <p className="text-slate-300 text-[10px] uppercase font-black tracking-[0.2em] whitespace-nowrap">
                Registered School
              </p>
            </div>
          </div>

          {/* Copyright & Legal Row */}
          <div className="mt-10 text-center pb-2">
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.25em]">
              © 2026 Thisara Driving School <span className="mx-3 text-[#E11B22]">•</span> Established Safety Since 2000
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
