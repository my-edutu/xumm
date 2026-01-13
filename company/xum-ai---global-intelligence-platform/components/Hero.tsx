
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-12 overflow-hidden px-6">
      {/* Background Image Layer - Fixed visibility and z-index */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <img 
          src="https://raw.githubusercontent.com/stackblitz/stackblitz-images/main/abstract-blue-gradient.jpg" 
          className="w-full h-full object-cover scale-105 motion-safe:animate-[pulse_20s_ease-in-out_infinite]"
          alt="Abstract Background"
          style={{ filter: 'brightness(0.55)' }}
        />
        {/* Deep overlays for high-end cinematic blend */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#020617]/40 to-[#020617] opacity-90"></div>
        <div className="absolute inset-0 bg-[#020617]/30 mix-blend-overlay"></div>
      </div>

      <div className="container max-w-6xl mx-auto text-center relative z-10">
        <div className="flex justify-center -space-x-3 mb-10 opacity-0 animate-[fadeIn_1s_ease-out_0.3s_forwards]">
          {[1, 2, 3, 4, 5].map((i) => (
            <img 
              key={i} 
              src={`https://i.pravatar.cc/100?img=${i + 30}`} 
              className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#020617] object-cover shadow-2xl hover:scale-110 transition-transform duration-300" 
              alt="AI Trainer"
            />
          ))}
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-600 border-2 border-[#020617] flex items-center justify-center text-[10px] md:text-xs font-black shadow-2xl">
            +1K
          </div>
        </div>

        {/* Text size increased on mobile to target ~4 lines, weight font-extrabold */}
        <h1 
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-[1.05] md:leading-[0.9] text-gradient max-w-[16ch] sm:max-w-[18ch] mx-auto opacity-0 animate-[fadeInUp_1s_ease-out_0.5s_forwards]"
          style={{ 
            fontFamily: "'Inter', sans-serif", 
            letterSpacing: '-0.04em',
            textShadow: '0 10px 40px rgba(0,0,0,0.6)'
          }}
        >
          The Global Human Intelligence Network powering next‑gen AI.
        </h1>
        
        <p className="text-base md:text-xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed tracking-tight font-medium opacity-0 animate-[fadeInUp_1s_ease-out_0.7s_forwards]">
          XUM AI turns real people into AI trainers. We deliver data creation, labeling, and RLHF at global scale — with cultural and linguistic coverage the world’s models are missing.
        </p>

        {/* Mobile specific button sizing: smaller on mobile (!py-4), larger on desktop (!py-7) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 opacity-0 animate-[fadeInUp_1s_ease-out_0.9s_forwards]">
          <button className="btn-primary w-full sm:w-auto gap-3 !text-sm sm:!text-lg !px-10 sm:!px-16 !py-4 sm:!py-7 shadow-blue-500/30 shadow-2xl hover:shadow-blue-500/50">
            Get Early Access
            <span className="material-symbols-outlined text-xl sm:text-2xl">bolt</span>
          </button>
          <button className="btn-secondary w-full sm:w-auto !text-sm sm:!text-lg !px-10 sm:!px-16 !py-4 sm:!py-7 border-white/20 hover:border-white/40">
            Buy Datasets / API
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1.05); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </section>
  );
};

export default Hero;
