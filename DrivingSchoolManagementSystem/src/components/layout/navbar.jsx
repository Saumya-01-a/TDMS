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
    const sectionIds = ['home', 'about', 'services', 'contact'];
    
    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px -80% 0px', // More precise for header high-highlighting
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
    { name: 'Contact Us', id: 'contact' },
  ];

  return (
    <header className="fixed top-0 left-0 w-full min-h-[90px] z-50 backdrop-blur-sm bg-slate-950/80 border-b border-white/10 flex items-center">
      <div className="max-w-[1440px] w-full mx-auto px-12 py-8 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <a href="/" className="hover:opacity-90 transition-opacity">
            <GlobalLogo layout="horizontal" className="h-12 w-auto object-contain" />
          </a>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-x-14">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={`relative text-lg font-medium transition-all duration-300 py-1
                ${activeSection === link.id 
                  ? 'text-yellow-400 font-bold' 
                  : 'text-white hover:text-[#ff4d4d]'
                }`}
            >
              {link.name}
              {activeSection === link.id && (
                <span className="absolute bottom-[-10px] left-0 w-full h-0.5 bg-[#ff4d4d] rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300 shadow-[0_0_12px_rgba(255,77,77,0.8)]"></span>
              )}
            </a>
          ))}
        </nav>

        {/* Right: Auth Buttons */}
        <div className="hidden md:flex items-center gap-8">
          <a 
            href="/login" 
            className="text-white text-lg font-medium hover:text-[#ff4d4d] hover:underline underline-offset-8 transition-all"
          >
            Log In
          </a>
          <a 
            href="/register" 
            className="bg-[#ff4d4d] text-white px-10 py-3 rounded-full font-bold text-lg hover:bg-[#e64444] hover:scale-105 hover:shadow-[0_0_20px_rgba(255,77,77,0.4)] active:scale-95 transition-all shadow-lg shadow-red-500/20 text-center flex items-center justify-center min-w-[160px]"
          >
            Sign Up
          </a>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden flex flex-col gap-1.5 cursor-pointer z-50" 
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          <span className={`w-6 h-0.5 bg-white transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`w-6 h-0.5 bg-white transition-all ${menuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`w-6 h-0.5 bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>

        {/* Mobile Menu Overlay */}
        {menuOpen && (
          <div className="md:hidden fixed inset-0 bg-slate-950 flex flex-col items-center justify-center gap-8 animate-in fade-in zoom-in duration-300">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setMenuOpen(false)}
                className={`text-2xl font-bold ${activeSection === link.id ? 'text-yellow-400' : 'text-white'}`}
              >
                {link.name}
              </a>
            ))}
            <div className="flex flex-col items-center gap-4 mt-4">
              <a href="/login" className="text-white text-xl">Log In</a>
              <a href="/register" className="bg-[#ff4d4d] text-white px-8 py-3 rounded-full font-bold text-xl">Sign Up</a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

