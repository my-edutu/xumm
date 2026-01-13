
import React from 'react';

const PlatformSections: React.FC = () => {
  return (
    <>
      <section className="py-16 md:py-20 bg-white/[0.01] border-y border-white/5">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 heading-font tracking-tight">Two Ways to Connect.</h2>
            <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto">One network, two specific tools for data buyers and data creators.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Enterprise Card */}
            <div className="p-10 bg-white/[0.02] border border-white/10 rounded-[2rem] flex flex-col group hover:border-blue-500/20 transition-all">
              <h3 className="text-2xl font-bold mb-2 text-white heading-font">For Businesses</h3>
              <p className="text-slate-500 text-xs mb-6 max-w-xs uppercase tracking-widest">Buy High-Quality Training Data</p>

              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-center gap-3 text-slate-400 text-sm">
                  <span className="material-symbols-outlined text-blue-500 text-base">check</span> Dataset Creation
                </li>
                <li className="flex items-center gap-3 text-slate-400 text-sm">
                  <span className="material-symbols-outlined text-blue-500 text-base">check</span> Safety Testing (RLHF)
                </li>
                <li className="flex items-center gap-3 text-slate-400 text-sm">
                  <span className="material-symbols-outlined text-blue-500 text-base">check</span> Enterprise API Access
                </li>
              </ul>

              <button className="btn-base btn-primary btn-lg w-full">Start Project</button>
            </div>

            {/* App Card */}
            <div className="p-10 bg-blue-600/5 border border-blue-600/20 rounded-[2rem] flex flex-col group">
              <h3 className="text-2xl font-bold mb-2 text-white heading-font">For Contributors</h3>
              <p className="text-slate-500 text-xs mb-6 max-w-xs uppercase tracking-widest">Earn by Teaching AI</p>

              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-center gap-3 text-slate-400 text-sm">
                  <span className="material-symbols-outlined text-blue-500 text-base">check</span> Weekly USD Payouts
                </li>
                <li className="flex items-center gap-3 text-slate-400 text-sm">
                  <span className="material-symbols-outlined text-blue-500 text-base">check</span> Level-Up Rewards
                </li>
                <li className="flex items-center gap-3 text-slate-400 text-sm">
                  <span className="material-symbols-outlined text-blue-500 text-base">check</span> Flexible Interface
                </li>
              </ul>

              <button className="btn-base btn-secondary btn-lg w-full">Download App</button>
            </div>
          </div>
        </div>
      </section>

      {/* Earn Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 heading-font tracking-tight">Earn by Teaching AI.</h2>
            <p className="text-slate-400 text-sm md:text-lg max-w-lg">
              Your perspective is valuable. Share it with AI labs and get paid for your insight.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-3 heading-font tracking-widest uppercase">
                <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">1</span>
                Flexible Work
              </h3>
              <div className="space-y-4">
                {[
                  { title: "Work Anywhere", detail: "Tasks take minutes, perfect for spare time." },
                  { title: "Verification Bonus", detail: "Check other's work for extra rewards." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <span className="material-symbols-outlined text-blue-500 text-xl">done_all</span>
                    <div>
                      <p className="font-bold text-sm text-white mb-0.5 heading-font">{item.title}</p>
                      <p className="text-slate-500 text-xs leading-relaxed">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-3 heading-font tracking-widest uppercase">
                <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">2</span>
                Safe Payouts
              </h3>
              <div className="space-y-4">
                {[
                  { title: "Fast Deposits", detail: "Weekly payments directly to your account." },
                  { title: "Global Access", detail: "Open to anyone with an internet connection." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <span className="material-symbols-outlined text-blue-500 text-xl">verified</span>
                    <div>
                      <p className="font-bold text-sm text-white mb-0.5 heading-font">{item.title}</p>
                      <p className="text-slate-500 text-xs leading-relaxed">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PlatformSections;
