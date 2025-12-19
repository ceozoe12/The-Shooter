
import React from 'react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
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
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Privacy Policy</h1>
            <p className="text-slate-500 font-medium text-xs uppercase tracking-widest">Last Updated: May {currentYear}</p>
          </div>
        </header>

        <section className="space-y-8 leading-relaxed">
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">1. Overview</h2>
            <p>
              The Shooter ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI Influencer production platform, including any integration with Google Services, Blotato, and Stripe.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">2. Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Google Account Data:</strong> When you use Google Sign-In, we collect your name, email address, and profile picture to create and manage your account.</li>
              <li><strong>Media Assets:</strong> We collect images you upload as references and the images generated via our AI engine.</li>
              <li><strong>User Content:</strong> We collect the text prompts and branding configurations you provide.</li>
              <li><strong>Payment Information:</strong> Financial transactions are processed via Stripe. We do not store full credit card numbers on our servers.</li>
              <li><strong>Google Drive Data:</strong> If you opt-in to Google Drive sync, we request limited "per-file" access to save generated images to a specific folder ("TheShooter/Production"). We do not read your other Drive files.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">3. How We Use Your Information</h2>
            <p>We use the collected data to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Facilitate AI image generation via the Google Gemini API.</li>
              <li>Enable social media scheduling and distribution via Blotato.</li>
              <li>Personalize your studio experience and manage subscription credits.</li>
              <li>Ensure security and prevent fraudulent use of our services.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">4. Third-Party Data Sharing</h2>
            <p>We share necessary data with these trusted partners to provide our services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Google (Gemini API):</strong> Prompts and reference images are sent to Google for processing. Google's use of this data is governed by their Generative AI Terms of Service.</li>
              <li><strong>Blotato:</strong> Your social account tokens and generated media are shared with Blotato for the purpose of distribution.</li>
              <li><strong>Stripe:</strong> Payment data is handled exclusively by Stripe.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">5. Data Retention & Deletion</h2>
            <p>
              We retain your data for as long as your account is active. You may request the deletion of your account and all associated media assets at any time by contacting us at <strong>privacy@theshooter.pro</strong>. Local session data can be cleared by logging out or clearing your browser's local storage.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">6. Security</h2>
            <p>
              We implement industry-standard AES-256 encryption and secure OAuth2 protocols for all third-party integrations. While we strive to use commercially acceptable means to protect your Personal Information, no method of transmission over the Internet is 100% secure.
            </p>
          </div>
        </section>

        <footer className="pt-12 border-t border-slate-800 text-center">
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">The Shooter &copy; {currentYear} • AI Governance Compliant</p>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
