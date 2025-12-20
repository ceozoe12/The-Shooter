import React, { useState, useEffect } from 'react';
import { CreditState, SubscriptionLevel } from '../types';
import { CREDIT_BLOCKS, BASIC_SUB_FEE, PRO_SUB_FEE } from '../constants';

interface BillingModalProps {
  credits: CreditState;
  onClose: () => void;
  setCredits: React.Dispatch<React.SetStateAction<CreditState>>;
}

const BillingModal: React.FC<BillingModalProps> = ({ credits, onClose, setCredits }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: 'sub' | 'pack', id: string, amount: number, price: number } | null>(null);
  const [manualKey, setManualKey] = useState(localStorage.getItem('manual_gemini_api_key') || '');
  const [showKeySaved, setShowKeySaved] = useState(false);

  const handleCheckout = () => {
    if (!selectedItem) return;
    setIsProcessing(true);
    // Simulate realistic Stripe payment processing
    setTimeout(() => {
      if (selectedItem.type === 'sub') {
        setCredits(prev => ({ ...prev, subscriptionLevel: selectedItem.id as SubscriptionLevel }));
      } else {
        setCredits(prev => ({ ...prev, creditsRemaining: prev.creditsRemaining + selectedItem.amount }));
      }
      setIsProcessing(false);
      setSelectedItem(null);
      alert("Payment successful! Your account has been updated.");
    }, 2500);
  };

  const handleSaveManualKey = () => {
    if (manualKey) {
      localStorage.setItem('manual_gemini_api_key', manualKey);
      setCredits(prev => ({ ...prev, apiKeySet: true }));
      setShowKeySaved(true);
      setTimeout(() => setShowKeySaved(false), 3000);
    }
  };

  const handleOpenGeminiKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Assume success as per instructions
      setCredits(prev => ({ ...prev, apiKeySet: true }));
    } else {
      alert("AI Studio key selector is unavailable in this environment. Please use the manual input below.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-slate-950/95 backdrop-blur-xl">
      <div className="w-full h-full md:h-auto md:max-w-5xl bg-slate-900 border border-slate-800 md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        
        {selectedItem ? (
          /* FULL SCREEN STRIPE CHECKOUT SIMULATION */
          <div className="flex-1 flex flex-col md:flex-row bg-white overflow-y-auto">
            {/* Left Side: Order Info */}
            <div className="md:w-1/2 p-8 md:p-16 bg-[#f6f9fc] flex flex-col">
              <button 
                onClick={() => setSelectedItem(null)} 
                className="text-[#424770] hover:text-[#0a2540] mb-12 flex items-center gap-2 font-bold text-sm transition-colors group"
              >
                <i className="fa-solid fa-arrow-left transition-transform group-hover:-translate-x-1"></i> 
                Back to The Shooter
              </button>
              
              <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <i className="fa-solid fa-camera-retro text-white text-xl"></i>
                </div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">The Shooter</h2>
              </div>

              <div className="space-y-1">
                <p className="text-[#424770] font-bold text-sm uppercase tracking-wider opacity-60">Subscribe to</p>
                <h1 className="text-4xl font-black text-[#0a2540]">
                  {selectedItem.type === 'sub' ? `${selectedItem.id.toUpperCase()} Plan` : `${selectedItem.amount} Production Credits`}
                </h1>
              </div>

              <div className="mt-8 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-[#0a2540]">${selectedItem.price.toFixed(2)}</span>
                <span className="text-[#424770] font-medium">{selectedItem.type === 'sub' ? 'per month' : 'one-time'}</span>
              </div>

              <div className="mt-auto pt-12 space-y-4">
                <div className="flex justify-between text-sm font-medium text-[#424770]">
                  <span>{selectedItem.id.toUpperCase()} Access</span>
                  <span>${selectedItem.price.toFixed(2)}</span>
                </div>
                <div className="h-px bg-[#e6ebf1]"></div>
                <div className="flex justify-between text-lg font-bold text-[#0a2540]">
                  <span>Total Due</span>
                  <span>${selectedItem.price.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-2 text-[10px] text-[#424770] font-bold uppercase tracking-widest opacity-40">
                <i className="fa-solid fa-lock"></i>
                Powered by Stripe
              </div>
            </div>

            {/* Right Side: Payment Form */}
            <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white">
              <div className="max-w-md w-full mx-auto space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#0a2540]">Pay with card</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#424770]">Email</label>
                      <input type="email" placeholder="creator@theshooter.pro" className="w-full p-3 border border-[#e6ebf1] rounded-lg shadow-sm focus:ring-2 focus:ring-[#635BFF] focus:border-transparent outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#424770]">Card information</label>
                      <div className="border border-[#e6ebf1] rounded-lg shadow-sm overflow-hidden">
                        <div className="flex items-center p-3 border-b border-[#e6ebf1]">
                          <i className="fa-solid fa-credit-card text-[#aab7c4] mr-3"></i>
                          <input type="text" placeholder="1234 5678 9101 1121" className="flex-1 outline-none text-sm" />
                          <div className="flex gap-2">
                            <i className="fa-brands fa-cc-visa text-xl text-[#1a1f71]"></i>
                            <i className="fa-brands fa-cc-mastercard text-xl text-[#eb001b]"></i>
                          </div>
                        </div>
                        <div className="flex">
                          <input type="text" placeholder="MM / YY" className="w-1/2 p-3 border-r border-[#e6ebf1] outline-none text-sm" />
                          <input type="text" placeholder="CVC" className="w-1/2 p-3 outline-none text-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#635BFF] hover:bg-[#0a2540] text-white rounded-lg font-bold text-lg shadow-xl shadow-blue-500/10 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  {isProcessing ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin"></i>
                      Processing...
                    </>
                  ) : (
                    `Pay $${selectedItem.price.toFixed(2)}`
                  )}
                </button>

                <p className="text-center text-xs text-[#424770] font-medium">
                  By confirming your subscription, you allow The Shooter to charge your card for this and future payments in accordance with their terms.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* MAIN BILLING VIEW */
          <>
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/20">
                  <i className="fa-solid fa-vault text-2xl text-blue-500"></i>
                </div>
                <div>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Studio Billing</h2>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Capital & API Infrastructure</p>
                </div>
              </div>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-white">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Plans & Subscriptions */}
                <div className="lg:col-span-7 space-y-10">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Subscription Tiers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Basic */}
                      <div className={`group p-8 rounded-[2rem] border-2 transition-all flex flex-col ${credits.subscriptionLevel === 'basic' ? 'border-blue-600 bg-blue-600/5' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'}`}>
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">Basic</h4>
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Growth</p>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-black text-white">${BASIC_SUB_FEE}</span>
                            <span className="text-[10px] text-slate-600 font-bold block">/MONTH</span>
                          </div>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                          <li className="flex items-center gap-3 text-xs font-bold text-slate-400">
                            <i className="fa-solid fa-circle-check text-blue-600"></i> Character Identity Lock
                          </li>
                          <li className="flex items-center gap-3 text-xs font-bold text-slate-400">
                            <i className="fa-solid fa-circle-check text-blue-600"></i> 10-Shot Batch Runs
                          </li>
                        </ul>
                        <button 
                          onClick={() => setSelectedItem({ type: 'sub', id: 'basic', amount: 0, price: BASIC_SUB_FEE })}
                          disabled={credits.subscriptionLevel === 'basic' || credits.subscriptionLevel === 'pro'}
                          className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                            credits.subscriptionLevel === 'basic' ? 'bg-blue-600 text-white cursor-default' : 
                            credits.subscriptionLevel === 'pro' ? 'bg-slate-800 text-slate-700 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                          }`}
                        >
                          {credits.subscriptionLevel === 'basic' ? 'Current Plan' : credits.subscriptionLevel === 'pro' ? 'Included' : 'Activate Basic'}
                        </button>
                      </div>

                      {/* Pro */}
                      <div className={`group p-8 rounded-[2rem] border-2 transition-all flex flex-col relative overflow-hidden ${credits.subscriptionLevel === 'pro' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'}`}>
                        <div className="absolute top-0 right-0 px-4 py-1 bg-blue-600 text-white text-[8px] font-black uppercase tracking-[0.3em] rounded-bl-xl">Top Choice</div>
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">Studio Pro</h4>
                            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Enterprise</p>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-black text-white">${PRO_SUB_FEE}</span>
                            <span className="text-[10px] text-slate-600 font-bold block">/MONTH</span>
                          </div>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                          <li className="flex items-center gap-3 text-xs font-bold text-slate-300">
                            <i className="fa-solid fa-star text-blue-500"></i> Advanced Brand Hub
                          </li>
                          <li className="flex items-center gap-3 text-xs font-bold text-slate-300">
                            <i className="fa-solid fa-star text-blue-500"></i> Distribution Bridge
                          </li>
                        </ul>
                        <button 
                          onClick={() => setSelectedItem({ type: 'sub', id: 'pro', amount: 0, price: PRO_SUB_FEE })}
                          disabled={credits.subscriptionLevel === 'pro'}
                          className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                            credits.subscriptionLevel === 'pro' ? 'bg-blue-600 text-white cursor-default' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white shadow-xl shadow-blue-500/20'
                          }`}
                        >
                          {credits.subscriptionLevel === 'pro' ? 'Current Plan' : 'Go Studio Pro'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* API KEY SECTION - REPAIRED & ENHANCED */}
                  <div className="bg-slate-950/50 rounded-[2rem] p-8 border border-slate-800 space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <h4 className="font-black italic uppercase tracking-tighter text-white flex items-center gap-3">
                          <i className="fa-solid fa-key text-yellow-500"></i>
                          Gemini Production Key
                        </h4>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Bypasses platform limits via your personal token</p>
                      </div>
                      {credits.apiKeySet && (
                        <div className="flex items-center gap-2 text-green-500">
                          <i className="fa-solid fa-circle-check text-[10px]"></i>
                          <span className="text-[10px] font-black uppercase tracking-widest">Integrated</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {/* AI Studio Linkage */}
                      <button 
                        onClick={handleOpenGeminiKey}
                        className="w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-[10px] font-black uppercase text-white tracking-widest flex items-center justify-center gap-3 border border-slate-700 transition-all active:scale-[0.98]"
                      >
                        <i className="fa-solid fa-link"></i>
                        Select Key via Google AI Studio
                      </button>

                      <div className="flex items-center gap-4 py-2">
                        <div className="flex-1 h-px bg-slate-800"></div>
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Or Enter Manually</span>
                        <div className="flex-1 h-px bg-slate-800"></div>
                      </div>

                      {/* Manual Key Input */}
                      <div className="relative group">
                        <input 
                          type="password"
                          placeholder="PASTE YOUR GEMINI API KEY HERE"
                          value={manualKey}
                          onChange={(e) => setManualKey(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-6 py-4 text-white font-mono text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-800 placeholder:font-sans placeholder:tracking-normal"
                        />
                        <button 
                          onClick={handleSaveManualKey}
                          className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[8px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                        >
                          {showKeySaved ? 'SAVED' : 'SAVE KEY'}
                        </button>
                      </div>
                      <p className="text-center text-[8px] text-slate-600 font-bold uppercase tracking-widest italic">
                        Your key is stored locally in your browser and never sent to our servers.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Credit Packs */}
                <div className="lg:col-span-5 space-y-6">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Shot Refills</h3>
                  <div className="space-y-3">
                    {CREDIT_BLOCKS.map(block => (
                      <button
                        key={block.amount}
                        onClick={() => setSelectedItem({ type: 'pack', id: block.label, amount: block.amount, price: block.price })}
                        className="w-full group flex items-center justify-between p-5 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-[1.5rem] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-800 group-hover:bg-blue-600/20 rounded-xl flex items-center justify-center transition-colors">
                            <i className="fa-solid fa-bolt-lightning text-slate-600 group-hover:text-blue-500"></i>
                          </div>
                          <div className="text-left">
                            <p className="font-black text-sm text-white italic uppercase tracking-tighter">{block.amount} Credits</p>
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{block.label}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-blue-500 text-lg">${block.price.toFixed(2)}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="p-8 bg-blue-600/5 rounded-[2rem] border border-blue-500/10 text-center space-y-3">
                    <i className="fa-solid fa-gift text-2xl text-blue-600 opacity-50"></i>
                    <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Referral Bonus</h5>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                      Invite a fellow creator and receive 10 bonus credits when they launch their first production.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <footer className="p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-center">
               <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] flex items-center gap-3">
                 <i className="fa-solid fa-shield-halved text-blue-600"></i>
                 Encrypted Financial Protocol 
                 <i className="fa-solid fa-circle text-[4px] opacity-20"></i>
                 PCI DSS Compliant
               </p>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};

export default BillingModal;
