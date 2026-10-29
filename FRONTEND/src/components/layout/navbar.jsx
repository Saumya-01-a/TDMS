import { useState, useEffect } from 'react';
import GlobalLogo from "../common/GlobalLogo";
import "./layout.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const sectionIds = ['home', 'about', 'services', 'pricing', 'contact'];
    
    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px -80% 0px', // Precise threshold for section detection
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => {
      sectionIds.forEach((id) => {
        const element = document.getElementById(id);
        if (element) observer.unobserve(element);
      });
    };
  }, []);

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'About Us', id: 'about' },
    { name: 'Services', id: 'services' },
    { name: 'Pricing', id: 'pricing' },
    { name: 'Contact Us', id: 'contact' },
  ];

  return (
    <header className="main-header fixed top-0 left-0 w-full min-h-[88px] z-50 backdrop-blur-md bg-slate-950/90 border-b border-white/10 flex items-center transition-all duration-300">
      {/* Centered Symmetrical Container with 16px 48px Padding */}
      <div 
        className="main-navbar-container w-full mx-auto flex items-center justify-between"
        style={{ maxWidth: "1280px", padding: "16px 48px", boxSizing: "border-box" }}
      >
        
        {/* Left: Logo strictly centered vertically */}
        <div className="flex items-center shrink-0">
          <a href="/" className="hover:opacity-90 transition-opacity flex items-center">
            <GlobalLogo layout="horizontal" className="h-11 sm:h-12 w-auto object-contain flex items-center" />
          </a>
        </div>

        {/* Center: Navigation Tabs with 32px Gap & White Active Text */}
        <nav 
          className="hidden lg:flex items-center"
          style={{ gap: "32px" }}
        >
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`relative text-base xl:text-lg transition-all duration-200 py-1 flex items-center ${
                  isActive 
                    ? 'text-white font-bold' 
                    : 'text-slate-300 hover:text-white font-medium'
                }`}
              >
                {link.name}
                {isActive && (
                  <span 
                    className="absolute -bottom-1.5 left-0 w-full h-[2.5px] bg-[#E11B22] rounded-full animate-in fade-in duration-200"
                    style={{ boxShadow: '0 0 10px rgba(225, 27, 34, 0.85)' }}
                  ></span>
                )}
              </a>
            );
          })}
        </nav>

        {/* Right: Auth Buttons strictly vertically centered */}
        <div className="hidden lg:flex items-center gap-6 shrink-0">
          <a 
            href="/login" 
            className="text-white text-base font-semibold hover:text-[#ff4d4d] transition-colors px-2 py-1 flex items-center"
          >
            Log In
          </a>
          <a 
            href="/register" 
            className="bg-[#E11B22] text-white px-7 py-2.5 rounded-full font-bold text-base hover:bg-[#c4141b] hover:scale-105 hover:shadow-[0_0_20px_rgba(225,27,34,0.4)] active:scale-95 transition-all shadow-lg shadow-red-500/25 text-center flex items-center justify-center min-w-[130px]"
          >
            Sign Up
          </a>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden flex flex-col gap-1.5 cursor-pointer z-50 p-2 items-center justify-center" 
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          <span className={`w-6 h-0.5 bg-white transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`w-6 h-0.5 bg-white transition-all ${menuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`w-6 h-0.5 bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>

        {/* Mobile Menu Overlay */}
        {menuOpen && (
          <div className="lg:hidden fixed inset-0 bg-slate-950/98 backdrop-blur-xl flex flex-col items-center justify-center gap-8 animate-in fade-in zoom-in duration-300 z-40">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={() => setMenuOpen(false)}
                  className={`text-2xl font-bold tracking-tight transition-colors ${
                    isActive ? 'text-white' : 'text-slate-300 hover:text-[#ff4d4d]'
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
            <div className="flex flex-col items-center gap-4 mt-6 w-full max-w-xs px-6">
              <a 
                href="/login" 
                onClick={() => setMenuOpen(false)}
                className="w-full text-center py-3 text-white text-lg font-semibold border border-white/20 rounded-xl hover:bg-white/10"
              >
                Log In
              </a>
              <a 
                href="/register" 
                onClick={() => setMenuOpen(false)}
                className="w-full text-center bg-[#E11B22] text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-red-600/30"
              >
                Sign Up
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
