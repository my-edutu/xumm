
import React from 'react';
import { useNavigate } from 'react-router-dom';

const CallToAction: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-20 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="relative bg-[#0f172a] border border-white/10 p-10 md:p-20 rounded-[2.5rem] overflow-hidden text-center shadow-2xl">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 blur-[100px] pointer-events-none"></div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-6 heading-font text-white outfit">Ready to build the future?</h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto font-medium">
              Join the thousands of partners and creators already powering the next generation of artificial intelligence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/waitlist')}
                className="btn-base btn-primary btn-lg w-full sm:w-auto px-10"
              >
                Get Started Now
              </button>
              <button
                onClick={() => navigate('/business')}
                className="btn-base btn-secondary btn-lg w-full sm:w-auto px-10"
              >
                XUM Business
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
