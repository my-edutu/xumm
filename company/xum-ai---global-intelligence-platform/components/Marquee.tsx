
import React from 'react';

const logosLine1 = [
  { name: "OpenAI", slug: "openai" },
  { name: "Google Gemini", slug: "googlegemini" },
  { name: "Meta", slug: "meta" },
  { name: "NVIDIA", slug: "nvidia" },
  { name: "Anthropic", slug: "anthropic" }
];

const logosLine2 = [
  { name: "Mistral AI", slug: "mistralai" },
  { name: "Microsoft", slug: "microsoft" },
  { name: "Hugging Face", slug: "huggingface" },
  { name: "Stability AI", slug: "stabilityai" },
  { name: "Tesla", slug: "tesla" }
];

const LogoItem: React.FC<{ logo: { name: string, slug: string } }> = ({ logo }) => (
  <div className="flex items-center gap-3 px-8 group cursor-default">
    <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors p-1.5">
      <img 
        src={`https://cdn.simpleicons.org/${logo.slug}`} 
        alt={logo.name} 
        className="w-full h-full object-contain filter grayscale brightness-200 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-500"
      />
    </div>
    <span className="text-xs font-bold tracking-widest text-white/10 group-hover:text-white/40 transition-colors heading-font uppercase">
      {logo.name}
    </span>
  </div>
);

const Marquee: React.FC = () => {
  return (
    <section className="py-10 border-y border-white/5 bg-black/40 relative overflow-hidden flex flex-col gap-8">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#020617] to-transparent z-10"></div>
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#020617] to-transparent z-10"></div>
      
      {/* Line 1 - Moving Left */}
      <div className="flex overflow-hidden whitespace-nowrap">
        <div className="marquee-track flex animate-scroll-left">
          <div className="flex items-center">
            {logosLine1.map((logo, i) => <LogoItem key={`l1a-${i}`} logo={logo} />)}
            {logosLine2.map((logo, i) => <LogoItem key={`l1b-${i}`} logo={logo} />)}
          </div>
          <div className="flex items-center">
            {logosLine1.map((logo, i) => <LogoItem key={`l1c-${i}`} logo={logo} />)}
            {logosLine2.map((logo, i) => <LogoItem key={`l1d-${i}`} logo={logo} />)}
          </div>
        </div>
      </div>

      {/* Line 2 - Moving Right */}
      <div className="flex overflow-hidden whitespace-nowrap">
        <div className="marquee-track flex animate-scroll-right">
          <div className="flex items-center">
            {logosLine2.map((logo, i) => <LogoItem key={`l2a-${i}`} logo={logo} />)}
            {logosLine1.map((logo, i) => <LogoItem key={`l2b-${i}`} logo={logo} />)}
          </div>
          <div className="flex items-center">
            {logosLine2.map((logo, i) => <LogoItem key={`l2c-${i}`} logo={logo} />)}
            {logosLine1.map((logo, i) => <LogoItem key={`l2d-${i}`} logo={logo} />)}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scrollRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-scroll-left {
          animation: scrollLeft 40s linear infinite;
        }
        .animate-scroll-right {
          animation: scrollRight 40s linear infinite;
        }
        .marquee-track {
          display: flex;
          width: max-content;
        }
      `}</style>
    </section>
  );
};

export default Marquee;
