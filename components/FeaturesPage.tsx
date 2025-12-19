
import React from 'react';

interface FeaturesPageProps {
  onBack: () => void;
  onStart: () => void;
}

const FeaturesPage: React.FC<FeaturesPageProps> = ({ onBack, onStart }) => {
  const currentYear = new Date().getFullYear();

  const detailedFeatures = [
    {
      icon: 'fa-dna',
      title: 'Advanced Facial Consistency',
      description: 'The Shooter uses Gemini 3 Pro Vision to analyze reference images and extract key biometric markers. This ensures that whether your influencer is in a dimly lit Parisian cafe or under harsh studio lights, their facial structure remains 100% consistent.',
      details: [
        'Multi-angle reference synthesis',
        'Lighting-adaptive likeness matching',
        'Hair and skin texture persistence'
      ]
    },
    {
      icon: 'fa-clapperboard',
      title: 'Storyboard Production Engine',
      description: 'Don\'t just generate one-off images. Our Storyboard AI takes your high-level concept and breaks it down into a logical 3, 5, 8, or 10-shot narrative sequence. It plans the pacing, lighting, and action steps for a "Day in the Life" feel.',
      details: [
        'Chronological scene planning',
        'Batch processing for speed',
        'Narrative cohesion check'
      ]
    },
    {
      icon: 'fa-copyright',
      title: 'Professional Brand Studio',
      description: 'Branding is everything. Our integrated Brand Studio allows you to apply high-precision watermarks, handle tags, and aesthetic overlays directly onto your generated assets. Plus, use our Canva integration for more complex design work.',
      details: [
        'Precision text positioning',
        'Typography & Color control',
        'Direct "Edit in Canva" shortcut'
      ]
    },
    {
      icon: 'fa-paper-plane',
      title: 'Distribution Hub via Blotato',
      description: 'Interface directly with the world\'s major social platforms. See exactly how your content looks on Instagram, TikTok, Facebook, Threads, YouTube Shorts, X (Twitter), and Bluesky. Schedule posts during peak engagement windows.',
      details: [
        'Native platform previews',
        'One-click multi-platform scheduling',
        'Omnichannel caption drafting'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-8 md:p-12 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold group"
          >
            <i className="fa-solid fa-arrow-left transition-transform group-hover:-translate-x-1"></i>
            Back to Home
          </button>
          <div className="text-center md:text-right">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Studio Features</h1>
            <p className="text-slate-500 font-medium">Inside The Shooter's Engine</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {detailedFeatures.map((f, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8 hover:bg-slate-800 transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
                <i className={`fa-solid ${f.icon} text-2xl text-blue-600`}></i>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">{f.title}</h2>
              <p className="text-slate-400 leading-relaxed mb-6 italic">
                {f.description}
              </p>
              <ul className="space-y-3">
                {f.details.map((detail, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm font-semibold text-slate-300">
                    <i className="fa-solid fa-circle-check text-blue-600 text-[10px]"></i>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <section className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-3xl p-8 md:p-12 text-center space-y-6">
          <h2 className="text-3xl font-bold text-white">Ready to take the shot?</h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg">
            Start with our one-time free use (3 images) and see the power of facial consistency for yourself. No credit card required to begin.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
             <button 
               onClick={onStart}
               className="px-10 py-4 bg-white text-slate-950 rounded-full font-black text-xl hover:bg-blue-50 transition-all shadow-xl shadow-blue-500/10"
             >
               Start Producing Now
             </button>
             <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
               The Shooter &copy; Powered by Gemini 3
             </p>
          </div>
        </section>

        <footer className="text-center pt-8 border-t border-slate-800">
           <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.4em]">The Shooter &copy; {currentYear}</p>
        </footer>
      </div>
    </div>
  );
};

export default FeaturesPage;
