
import React, { useEffect, useState, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import Features from './components/Features';
import PlatformSections from './components/PlatformSections';
import FAQ from './components/FAQ';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';

const StatCounter = ({ value, label }: { value: string, label: string }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const target = parseInt(value.replace(/\D/g, ''));
  const suffix = value.replace(/[\d]/g, '');
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        let start = 0;
        const duration = 2000;
        const startTime = performance.now();
        
        const animate = (now: number) => {
          const progress = Math.min((now - startTime) / duration, 1);
          setDisplayValue(Math.floor(progress * target));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.1 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center group">
      <div className="text-3xl md:text-5xl font-black mb-1 heading-font text-white group-hover:text-blue-400 transition-colors">
        {displayValue}{suffix}
      </div>
      <div className="text-[9px] uppercase tracking-[0.3em] text-slate-500 font-bold">
        {label}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020617]/50 selection:bg-blue-600/30">
      <Navbar />
      <Hero />
      <Marquee />
      
      {/* Network in Motion Stats */}
      <div className="py-12 md:py-16 border-t border-white/5 relative overflow-hidden">
        <div className="container max-w-6xl mx-auto px-6 relative z-10">
          <h2 className="text-center text-[10px] font-black uppercase tracking-[0.5em] text-blue-500/60 mb-8 md:mb-12">Live Ecosystem Activity</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCounter value="50K+" label="Active Creators" />
            <StatCounter value="12M+" label="Data Points" />
            <StatCounter value="99%" label="Accuracy Rate" />
            <StatCounter value="2M+" label="Total Rewards" />
          </div>
        </div>
      </div>

      <Features />
      <PlatformSections />
      <CallToAction />
      <FAQ />
      <Footer />
    </div>
  );
};

export default App;
