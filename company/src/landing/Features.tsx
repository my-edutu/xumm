
import React from 'react';

const Features: React.FC = () => {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-black/10">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center mb-20 md:mb-28">
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500/10 text-blue-500 text-[10px] font-bold tracking-widest mb-6 uppercase">
              The XUM Difference
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight heading-font">AI Built on <br/>Human Truth.</h2>
            <p className="text-slate-400 text-base md:text-lg mb-8 leading-relaxed max-w-xl">
              Most AI models struggle because their data is messy. We fix that by having real humans verify every piece of information before your AI ever sees it. No guesses, just facts.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-blue-500 text-xl">fact_check</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1 heading-font">Human-Verified Quality</h4>
                  <p className="text-slate-500 text-sm">Real people cross-check data to remove bias and mistakes.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-blue-500 text-xl">bolt</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1 heading-font">Ultra-Fast Delivery</h4>
                  <p className="text-slate-500 text-sm">Get thousands of high-quality inputs in hours, not weeks.</p>
                </div>
              </div>
            </div>
            <button className="btn-secondary !rounded-xl !px-6 !py-3">
              See the Quality Process
            </button>
          </div>
          <div className="relative aspect-square max-w-lg mx-auto w-full rounded-[3rem] border border-white/5 flex items-center justify-center group bg-white/5 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.1)_0%,_transparent_70%)]"></div>
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="w-64 h-64 border border-blue-500/10 rounded-full animate-pulse flex items-center justify-center">
                <div className="w-48 h-48 border border-blue-500/20 rounded-full flex items-center justify-center">
                  <div className="w-32 h-32 bg-blue-600/20 rounded-full flex items-center justify-center backdrop-blur-3xl">
                    <span className="material-symbols-outlined text-5xl text-blue-500">verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="py-16 border-t border-white/5">
          <div className="max-w-2xl mb-10 md:mb-14">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 heading-font tracking-tight">Simple Steps to Better Data.</h2>
            <p className="text-slate-400 text-base md:text-lg">A straightforward process to turn human insight into machine performance.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl">
            {[
              { icon: "person_add", title: "Join the Network", desc: "Experts sign up and take a skill test to ensure they are high-quality contributors." },
              { icon: "assignment", title: "Task Matching", desc: "Our system sends data tasks to the people best suited to solve them based on expertise." },
              { icon: "group", title: "Human Consensus", desc: "Every task is checked by multiple people. Only when they all agree is the data approved." },
              { icon: "api", title: "Instant Access", desc: "The verified, cleaned data is delivered directly to your AI via our high-speed API." }
            ].map((s, i) => (
              <div key={i} className="relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center mb-5 group-hover:bg-blue-600/20 transition-colors">
                  <span className="material-symbols-outlined text-blue-500">{s.icon}</span>
                </div>
                <h4 className="font-bold text-white text-lg mb-2 heading-font">{s.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
