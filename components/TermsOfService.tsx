
import React from 'react';

interface TermsOfServiceProps {
  onBack: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 p-8 md:p-12 overflow-y-auto font-sans selection:bg-blue-600 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold group text-sm uppercase tracking-widest"
          >
            <i className="fa-solid fa-arrow-left transition-transform group-hover:-translate-x-1"></i>
            Return
          </button>
          <div className="text-right">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Terms of Service</h1>
            <p className="text-slate-500 font-medium text-xs uppercase tracking-widest">Effective: May {currentYear}</p>
          </div>
        </header>

        <section className="space-y-8 leading-relaxed">
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">1. Acceptance of Terms</h2>
            <p>
              By accessing or using The Shooter, you agree to be bound by these Terms of Service. If you do not agree to all terms, you may not access the service.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">2. AI Ethics & Prohibited Content</h2>
            <p>You agree NOT to use the service to generate:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Non-consensual sexual content or "deepfakes" of real persons without explicit legal permission.</li>
              <li>Content that promotes hate speech, violence, or illegal acts.</li>
              <li>Deceptive content intended to impersonate real public figures or government officials.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">3. Intellectual Property</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>User Ownership:</strong> You retain ownership of the prompts and reference images you upload. You own the specific outputs generated for your account, subject to Google's underlying model terms.</li>
              <li><strong>Platform Rights:</strong> The Shooter retains all rights to its software, UI design, branding, and proprietary "Character DNA" analysis algorithms.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">4. Credits & Subscriptions</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Non-Refundable:</strong> AI generations are non-deterministic. Credits used for images containing artifacts or "hallucinations" are generally non-refundable.</li>
              <li><strong>Expirations:</strong> Paid credits do not expire unless your account is inactive for more than 12 months.</li>
              <li><strong>Pricing:</strong> We reserve the right to change our subscription fees with 30 days' notice.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">5. Limitation of Liability</h2>
            <p>
              The Shooter is provided "as is." We are not liable for any damages resulting from AI-generated content or social media account suspensions occurring through our distribution bridge. It is your responsibility to comply with individual social platform guidelines (e.g., Instagram's AI disclosure policies).
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">6. Third-Party API Keys</h2>
            <p>
              Users who provide their own Gemini API keys are responsible for all charges incurred on their Google Cloud accounts. The Shooter acts only as a client interface.
            </p>
          </div>
        </section>

        <footer className="pt-12 border-t border-slate-800 text-center">
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">The Shooter &copy; {currentYear} • Production Standard v1.0</p>
        </footer>
      </div>
    </div>
  );
};

export default TermsOfService;
