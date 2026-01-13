
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 py-16 px-6 bg-[#020617] relative overflow-hidden">
      {/* Background glow for consistency */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-blue-600/5 blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-12 mb-16">
          <div className="max-w-xs">
            <a className="flex items-center gap-2 mb-6" href="#">
              <span className="font-black text-3xl tracking-tighter uppercase text-white heading-font">XUM AI</span>
            </a>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Powering the next generation of artificial intelligence through global human intelligence and verified truth.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 md:gap-20">
            <div className="flex flex-col gap-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 mb-2">Platform</h4>
              <a className="text-sm font-bold text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-widest" href="#">Solutions</a>
              <a className="text-sm font-bold text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-widest" href="#">Datasets</a>
              <a className="text-sm font-bold text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-widest" href="#">Enterprise</a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 mb-2">Resources</h4>
              <a className="text-sm font-bold text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-widest" href="#">Documentation</a>
              <a className="text-sm font-bold text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-widest" href="#">Privacy</a>
              <a className="text-sm font-bold text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-widest" href="#">Support</a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 mb-2">Company</h4>
              <a className="text-sm font-bold text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-widest" href="#">About</a>
              <a className="text-sm font-bold text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-widest" href="#">Careers</a>
              <a className="text-sm font-bold text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-widest" href="#">Contact</a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-slate-600 font-black">
          <p>© 2026 XUM AI.</p>
          <div className="flex items-center gap-8">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors">Discord</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
