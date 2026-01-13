
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  onGetStarted?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onGetStarted }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isBusinessPage = location.pathname === '/business';
  const isHomePage = location.pathname === '/';

  const handleAction = () => {
    if (isBusinessPage) {
      navigate('/auth');
    } else {
      navigate('/waitlist');
    }
  };

  const scrollToSection = (id: string) => {
    if (!isHomePage) {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
      <nav className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex-shrink-0">
          <Link className="flex items-center" to="/">
            <span className="font-black text-2xl tracking-tighter uppercase text-white heading-font">XUM AI</span>
          </Link>
        </div>
        <div className="hidden lg:flex flex-grow justify-center items-center gap-10 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          <button onClick={() => scrollToSection('features')} className="hover:text-blue-500 transition-colors uppercase tracking-[0.2em]">Features</button>
          <button onClick={() => scrollToSection('ecosystem')} className="hover:text-blue-500 transition-colors uppercase tracking-[0.2em]">Ecosystem</button>
          <Link className="hover:text-blue-500 transition-colors" to="/business">Enterprise</Link>
          <Link className="hover:text-blue-500 transition-colors" to="/faq">FAQ</Link>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <button
            onClick={handleAction}
            className="btn-base btn-primary btn-md px-8"
          >
            Get Started
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
