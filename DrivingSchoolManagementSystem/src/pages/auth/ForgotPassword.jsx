import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import GlobalLogo from "../../components/common/GlobalLogo";

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch("http://localhost:3000/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data?.message || "Failed to process request");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 font-sans relative">
      
      {/* Centered Card Layout */}
      <div className="w-full max-w-xl bg-slate-900/40 backdrop-blur-3xl border border-white/10 p-16 rounded-[3rem] shadow-2xl flex flex-col gap-y-10 items-center relative z-10">
        
        {/* Content Alignment (Center Everything) */}
        <GlobalLogo layout="horizontal" className="h-12 w-auto object-contain" />

        {!submitted ? (
          <>
            <div className="flex flex-col items-center gap-y-4">
              <h1 className="text-4xl font-black text-white tracking-tight">Reset Password</h1>
              <p className="text-center text-slate-400 leading-relaxed max-w-sm">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-y-10">
              
              {error && (
                <div style={{ color: "crimson", fontSize: 14, padding: '12px 16px', background: 'rgba(220, 20, 60, 0.1)', borderRadius: '12px', border: '1px solid rgba(220,20,60,0.2)', width: '100%', maxWidth: '28rem', textAlign: 'center' }}>
                  {error}
                </div>
              )}

              <div className="w-full max-w-md flex flex-col gap-y-3">
                <label htmlFor="email" className="text-sm font-bold text-slate-300 uppercase tracking-widest text-center">
                  Email Address
                </label>
                <div className="relative w-full">
                  <input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-900/50 border border-white/10 text-white rounded-2xl px-6 py-4 focus:outline-none focus:border-[#ff4d4d] focus:ring-1 focus:ring-[#ff4d4d]/50 transition-all placeholder:text-slate-600 text-lg"
                  />
                </div>
              </div>

              {/* The Button (Compact & Sleek) */}
              <button 
                type="submit" 
                disabled={loading}
                className="flex items-center justify-center min-w-[250px] h-[52px] bg-[#ff4d4d] text-white rounded-full text-sm hover:bg-[#e64444] hover:scale-[1.05] transition-all tracking-[0.2em] uppercase cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Send Reset Link"}
              </button>
            </form>

            {/* Navigation Link */}
            <div className="mt-6 text-center">
              <Link 
                to="/login" 
                className="group inline-flex items-center gap-3 text-slate-400 hover:text-[#ff4d4d] transition-all text-sm font-bold uppercase tracking-widest"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" />
                Back to Login
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Success State (Styled to match the balanced gap-y-10 layout) */}
            <div className="flex flex-col items-center gap-y-4">
              <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 mb-4">
                <CheckCircle className="text-green-500" size={48} />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight">Check Your Email</h2>
              <p className="text-center text-slate-400 leading-relaxed max-w-sm">
                We've sent a high-priority password reset link to: <br /> 
                <span className="text-[#ff4d4d] font-bold text-lg mt-2 block italic tracking-normal">{email}</span>
              </p>
            </div>
            
            <div className="w-full flex flex-col items-center gap-y-6 mt-6">
              <Link 
                to="/login" 
                className="w-fit px-12 py-3 bg-white/10 text-white rounded-full font-black text-lg hover:bg-white/20 hover:scale-[1.05] transition-all tracking-widest uppercase"
              >
                Return to Login
              </Link>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-slate-500 hover:text-[#ff4d4d] text-sm font-bold uppercase tracking-[0.2em] transition-colors cursor-pointer"
              >
                Didn't receive it? Try again
              </button>
            </div>
          </>
        )}
      </div>

      {/* Footer text placed outside the card to maintain strict card layout */}
      <div className="absolute bottom-6 w-full text-center opacity-30 pointer-events-none">
        <p className="text-slate-400 text-xs font-black uppercase tracking-[0.4em]">Thisara Driving School</p>
      </div>
    </div>
  );
}
