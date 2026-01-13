
import React from 'react';

const CallToAction: React.FC = () => {
  return (
    <section className="py-12 md:py-20 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="relative bg-[#0f172a] border border-white/10 p-10 md:p-20 rounded-[2.5rem] overflow-hidden text-center shadow-2xl">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 blur-[100px] pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 heading-font">Ready to build the future?</h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
              Join the thousands of partners and creators already powering the next generation of artificial intelligence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="btn-primary w-full sm:w-auto !text-sm">
                Get Started Now
              </button>
              <button className="btn-secondary w-full sm:w-auto !text-sm">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
