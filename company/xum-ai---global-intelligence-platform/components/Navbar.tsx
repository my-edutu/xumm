
import React from 'react';

const Navbar: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
      <nav className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex-shrink-0">
          <a className="flex items-center" href="#">
            <span className="font-black text-2xl tracking-tighter uppercase text-white heading-font">XUM AI</span>
          </a>
        </div>
        <div className="hidden lg:flex flex-grow justify-center items-center gap-10 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          <a className="hover:text-blue-500 transition-colors" href="#">Features</a>
          <a className="hover:text-blue-500 transition-colors" href="#">Solutions</a>
          <a className="hover:text-blue-500 transition-colors" href="#">Enterprise</a>
          <a className="hover:text-blue-500 transition-colors" href="#">FAQ</a>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <button className="btn-primary !px-6 !py-2.5 !text-[10px]">
            Join Waitlist
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
