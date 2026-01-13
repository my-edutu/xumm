
import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  onAdminClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
  const handleComingSoon = (e: React.MouseEvent) => {
    e.preventDefault();
    alert("This feature is coming soon!");
  };

  return (
    <footer className="border-t border-white/5 py-16 px-6 bg-[#020617] relative overflow-hidden">
      {/* Background glow for consistency */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-blue-600/5 blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-12 mb-16">
          <div className="max-w-xs">
            <Link className="flex items-center gap-2 mb-6" to="/">
              <span className="font-black text-3xl tracking-tighter uppercase text-white heading-font">XUM AI</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed font-black opacity-60">
              BUILDING THE WORLD'S LARGEST ETHICAL HUMAN INTELLIGENCE NETWORK.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 md:gap-20">
            <div className="flex flex-col gap-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 mb-2">Ecosystem</h4>
              <Link className="text-sm font-bold text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-widest" to="/waitlist">Waitlist</Link>
              <Link className="text-sm font-bold text-slate-400 hover:text-orange-500 transition-colors uppercase tracking-widest" to="/business">Business</Link>
              <a className="text-sm font-bold text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-widest" href="#" onClick={handleComingSoon}>API Docs</a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 mb-2">Support</h4>
              <a className="text-sm font-bold text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-widest" href="#" onClick={handleComingSoon}>Privacy</a>
              <a className="text-sm font-bold text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-widest" href="#" onClick={handleComingSoon}>Support</a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 mb-2">Company</h4>
              <a className="text-sm font-bold text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-widest" href="#" onClick={handleComingSoon}>About</a>
              <Link
                to="/auth?intent=admin"
                className="text-sm font-bold text-slate-400 hover:text-orange-500 transition-colors uppercase tracking-widest text-left"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-slate-600 font-black">
          <div className="flex items-center gap-6">
            <p>© 2026 XUM AI.</p>
          </div>
          <div className="flex items-center gap-8">
            <a href="#" onClick={handleComingSoon} className="hover:text-white transition-colors">Twitter</a>
            <a href="#" onClick={handleComingSoon} className="hover:text-white transition-colors">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
