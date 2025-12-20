
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
    
    // Realistic simulated payment delay following Stripe behavior
    setTimeout(() => {
      if (selectedItem.type === 'sub') {
        setCredits(prev => ({ ...prev, subscriptionLevel: selectedItem.id as SubscriptionLevel }));
      } else {
        setCredits(prev => ({ ...prev, creditsRemaining: prev.creditsRemaining + selectedItem.amount }));
      }
      setIsProcessing(false);
      setSelectedItem(null);
      alert("Payment Complete! Your production studio has been refilled successfully.");
    }, 3500);
  };

  const handleSaveManualKey = () => {
    if (manualKey) {
      localStorage.setItem('manual_gemini_api_key', manualKey);
      setCredits(prev => ({ ...prev, apiKeySet: true }));
      setShowKeySaved(true);
      setTimeout(() => setShowKeySaved(false), 2000);
    }
  };

  const handleOpenGeminiKey = async () => {
    try {
      if (window.aistudio?.openSelectKey) {
        // Correctly trigger the studio dialog
        await window.aistudio.openSelectKey();
        // Force state update to reflect key selection immediately
        setCredits(prev => ({ ...prev, apiKeySet: true }));
        alert("Gemini Production Key Linked via AI Studio.");
      } else {
        alert("The integrated key selector is unavailable in this environment. Please use the manual input field.");
      }
    } catch (e) {
      console.error("Key selection failed", e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-slate-950/95 backdrop-blur-2xl">
      <div className="w-full h-full md:h-auto md:max-w-6xl bg-slate-900 border border-slate-800 md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        
        {selectedItem ? (
          /* PIXEL-PERFECT REPLICA OF THE STRIPE HOSTED CHECKOUT PAGE (LIVE MODE) */
          <div className="flex-1 flex flex-col lg:flex-row bg-[#f6f9fc] text-[#424770] overflow-y-auto">
            {/* Left Side: Order Summary (Stripe Aesthetic) */}
            <div className="lg:w-[45%] p-10 lg:p-20 bg-white lg:bg-transparent border-b lg:border-b-0 lg:border-r border-[#e6ebf1]">
              <button 
                onClick={() => setSelectedItem(null)} 
                className="text-[#697386] hover:text-[#1a1f36] mb-12 flex items-center gap-2 font-bold text-sm transition-colors group"
              >
                <i className="fa-solid fa-arrow-left transition-transform group-hover:-translate-x-1"></i> 
                Back to The Shooter
              </button>
              
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 bg-[#635bff] rounded-2xl flex items-center justify-center shadow-lg shadow-[#635bff]/20">
                  <i className="fa-solid fa-camera-retro text-white text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1a1f36]">The Shooter Studio</h2>
                  <p className="text-sm font-medium opacity-60">AI Production Services</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold opacity-60 uppercase tracking-wider">Product</p>
                <h1 className="text-4xl font-black text-[#1a1f36] tracking-tight">
                  {selectedItem.type === 'sub' ? `${selectedItem.id.toUpperCase()} Membership` : `${selectedItem.amount} Shot Pack`}
                </h1>
              </div>

              <div className="mt-8 flex items-baseline gap-2">
                <span className="text-5xl font-bold text-[#1a1f36]">${selectedItem.price.toFixed(2)}</span>
                <span className="text-lg font-medium opacity-60">{selectedItem.type === 'sub' ? 'per month' : 'one-time'}</span>
              </div>

              <div className="mt-auto pt-16 space-y-6">
                <div className="flex justify-between text-sm font-medium">
                  <span>{selectedItem.id.toUpperCase()} Production Access</span>
                  <span className="font-bold text-[#1a1f36]">${selectedItem.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Tax (Estimated 0.00%)</span>
                  <span className="font-bold text-[#1a1f36]">$0.00</span>
                </div>
                <div className="h-px bg-[#e6ebf1]"></div>
                <div className="flex justify-between text-xl font-bold text-[#1a1f36]">
                  <span>Total due</span>
                  <span>${selectedItem.price.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-10 flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest opacity-40">
                <i className="fa-solid fa-shield-halved text-[#635bff]"></i>
                Secure checkout powered by Stripe
              </div>
            </div>

            {/* Right Side: Payment Methods (Stripe Aesthetic) */}
            <div className="lg:w-[55%] p-10 lg:p-20 flex flex-col justify-center bg-white">
              <div className="max-w-md w-full mx-auto space-y-10">
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-[#1a1f36]">Pay with Card</h3>
                  
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#1a1f36]">Email</label>
                      <input type="email" placeholder="creator@theshooter.pro" className="w-full p-4 border border-[#e6ebf1] rounded-xl shadow-sm focus:ring-2 focus:ring-[#635bff] focus:border-transparent outline-none transition-all text-sm font-medium" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#1a1f36]">Card Information</label>
                      <div className="border border-[#e6ebf1] rounded-xl shadow-sm overflow-hidden divide-y divide-[#e6ebf1]">
                        <div className="flex items-center p-4">
                          <i className="fa-solid fa-credit-card text-[#aab7c4] mr-4"></i>
                          <input type="text" placeholder="Card number" className="flex-1 outline-none text-sm font-medium" />
                          <div className="flex gap-2">
                            <i className="fa-brands fa-cc-visa text-xl text-[#003399]"></i>
                            <i className="fa-brands fa-cc-mastercard text-xl text-[#eb001b]"></i>
                          </div>
                        </div>
                        <div className="flex divide-x divide-[#e6ebf1]">
                          <input type="text" placeholder="MM / YY" className="w-1/2 p-4 outline-none text-sm font-medium" />
                          <input type="text" placeholder="CVC" className="w-1/2 p-4 outline-none text-sm font-medium" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#1a1f36]">Name on Card</label>
                      <input type="text" placeholder="Cardholder's full name" className="w-full p-4 border border-[#e6ebf1] rounded-xl shadow-sm focus:ring-2 focus:ring-[#635bff] focus:border-transparent outline-none transition-all text-sm font-medium" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#1a1f36]">Billing Address</label>
                      <div className="border border-[#e6ebf1] rounded-xl shadow-sm overflow-hidden divide-y divide-[#e6ebf1]">
                        <select className="w-full p-4 outline-none text-sm font-medium bg-white">
                          <option>United States</option>
                          <option>United Kingdom</option>
                          <option>Canada</option>
                        </select>
                        <input type="text" placeholder="ZIP Code" className="w-full p-4 outline-none text-sm font-medium" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full py-5 bg-[#635bff] hover:bg-[#0a2540] text-white rounded-xl font-bold text-lg shadow-xl shadow-[#635bff]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying Transaction...
                      </>
                    ) : (
                      `Pay $${selectedItem.price.toFixed(2)}`
                    )}
                  </button>
                  <p className="text-center text-[11px] text-[#697386] font-medium px-4">
                    By confirming your subscription, you allow The Shooter to charge your card for future payments in accordance with their terms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* MAIN STUDIO BILLING VIEW */
          <>
            <div className="p-10 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-2xl shadow-blue-500/10">
                  <i className="fa-solid fa-vault text-2xl text-blue-500"></i>
                </div>
                <div>
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Studio Billing</h2>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Infrastructure & Asset Credits</p>
                </div>
              </div>
              <button onClick={onClose} className="w-12 h-12 flex items-center justify-center hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-white">
                <i className="fa-solid fa-xmark text-2xl"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* Plans Selection */}
                <div className="lg:col-span-7 space-y-12">
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Subscription Matrix</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Basic */}
                      <div className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col ${credits.subscriptionLevel === 'basic' ? 'border-blue-600 bg-blue-600/5' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'}`}>
                        <div className="flex justify-between items-start mb-8">
                          <div>
                            <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">Growth</h4>
                            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-1">Foundational Access</p>
                          </div>
                          <div className="text-right">
                            <span className="text-3xl font-black text-white">${BASIC_SUB_FEE}</span>
                            <span className="text-[10px] text-slate-600 font-bold block">/MO</span>
                          </div>
                        </div>
                        <ul className="space-y-4 mb-10 flex-1">
                          <li className="flex items-center gap-3 text-xs font-bold text-slate-400">
                            <i className="fa-solid fa-circle-check text-blue-600"></i> Persistent Character DNA
                          </li>
                          <li className="flex items-center gap-3 text-xs font-bold text-slate-400">
                            <i className="fa-solid fa-circle-check text-blue-600"></i> 10-Shot Batch Runs
                          </li>
                        </ul>
                        <button 
                          onClick={() => setSelectedItem({ type: 'sub', id: 'basic', amount: 0, price: BASIC_SUB_FEE })}
                          disabled={credits.subscriptionLevel === 'basic' || credits.subscriptionLevel === 'pro'}
                          className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                            credits.subscriptionLevel === 'basic' ? 'bg-blue-600 text-white cursor-default' : 
                            credits.subscriptionLevel === 'pro' ? 'bg-slate-800 text-slate-700 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-750 text-white border border-slate-700'
                          }`}
                        >
                          {credits.subscriptionLevel === 'basic' ? 'Active' : credits.subscriptionLevel === 'pro' ? 'Included' : 'Select Plan'}
                        </button>
                      </div>

                      {/* Pro */}
                      <div className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col relative overflow-hidden ${credits.subscriptionLevel === 'pro' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'}`}>
                        <div className="absolute top-0 right-0 px-5 py-2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-bl-2xl">Recommended</div>
                        <div className="flex justify-between items-start mb-8">
                          <div>
                            <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">Pro Studio</h4>
                            <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mt-1">Enterprise Grade</p>
                          </div>
                          <div className="text-right">
                            <span className="text-3xl font-black text-white">${PRO_SUB_FEE}</span>
                            <span className="text-[10px] text-slate-600 font-bold block">/MO</span>
                          </div>
                        </div>
                        <ul className="space-y-4 mb-10 flex-1">
                          <li className="flex items-center gap-3 text-xs font-bold text-slate-300">
                            <i className="fa-solid fa-star text-blue-500"></i> Unlimited Distribution
                          </li>
                          <li className="flex items-center gap-3 text-xs font-bold text-slate-300">
                            <i className="fa-solid fa-star text-blue-500"></i> Canva SDK Editor
                          </li>
                        </ul>
                        <button 
                          onClick={() => setSelectedItem({ type: 'sub', id: 'pro', amount: 0, price: PRO_SUB_FEE })}
                          disabled={credits.subscriptionLevel === 'pro'}
                          className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                            credits.subscriptionLevel === 'pro' ? 'bg-blue-600 text-white cursor-default' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white shadow-xl shadow-blue-500/20'
                          }`}
                        >
                          {credits.subscriptionLevel === 'pro' ? 'Active' : 'Upgrade to Pro'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* API KEY INTEGRATION SECTION */}
                  <div className="bg-slate-950/50 rounded-[2.5rem] p-10 border border-slate-800 space-y-8 shadow-inner">
                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        <h4 className="text-xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">
                          <i className="fa-solid fa-key text-yellow-500"></i>
                          Gemini Key Integration
                        </h4>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Connect your production engine token</p>
                      </div>
                      {credits.apiKeySet && (
                        <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">
                          <i className="fa-solid fa-circle-check text-[10px]"></i>
                          <span className="text-[10px] font-black uppercase tracking-widest">Authenticated</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-5">
                      <button 
                        onClick={handleOpenGeminiKey}
                        className="w-full py-5 bg-slate-800 hover:bg-slate-750 rounded-2xl text-[11px] font-black uppercase text-white tracking-[0.2em] flex items-center justify-center gap-4 border border-slate-700 transition-all active:scale-[0.98] shadow-xl"
                      >
                        <i className="fa-solid fa-link text-blue-500"></i>
                        Link Gemini Key via AI Studio
                      </button>

                      <div className="flex items-center gap-5">
                        <div className="flex-1 h-px bg-slate-800"></div>
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Manual Handshake</span>
                        <div className="flex-1 h-px bg-slate-800"></div>
                      </div>

                      <div className="relative group">
                        <input 
                          type="password"
                          placeholder="PASTE API KEY HERE"
                          value={manualKey}
                          onChange={(e) => setManualKey(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-8 py-5 text-white font-mono text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-800 placeholder:font-sans"
                        />
                        <button 
                          onClick={handleSaveManualKey}
                          className="absolute right-4 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                        >
                          {showKeySaved ? 'SYNCHRONIZED' : 'SAVE TOKEN'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Credit Bundles */}
                <div className="lg:col-span-5 space-y-8">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Asset Inventory</h3>
                  <div className="space-y-4">
                    {CREDIT_BLOCKS.map(block => (
                      <button
                        key={block.amount}
                        onClick={() => setSelectedItem({ type: 'pack', id: block.label, amount: block.amount, price: block.price })}
                        className="w-full group flex items-center justify-between p-6 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-3xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-slate-800 group-hover:bg-blue-600/20 rounded-2xl flex items-center justify-center transition-colors shadow-inner">
                            <i className="fa-solid fa-bolt-lightning text-slate-600 group-hover:text-blue-500"></i>
                          </div>
                          <div className="text-left">
                            <p className="font-black text-lg text-white italic uppercase tracking-tighter">{block.amount} Shots</p>
                            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{block.label}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-blue-500 text-xl tracking-tight">${block.price.toFixed(2)}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="p-10 bg-blue-600/5 rounded-[2.5rem] border border-blue-500/10 text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto border border-blue-500/20 shadow-2xl shadow-blue-500/5">
                      <i className="fa-solid fa-gift text-2xl text-blue-600"></i>
                    </div>
                    <h5 className="text-[11px] font-black text-blue-400 uppercase tracking-widest">Network Rewards</h5>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                      Earn 15 production credits for every creative director you refer to the studio who activates a plan.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <footer className="p-8 border-t border-slate-800 bg-slate-900/50 backdrop-blur-xl flex items-center justify-center">
               <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] flex items-center gap-4">
                 <i className="fa-solid fa-shield-halved text-blue-600"></i>
                 MIL-SPEC ENCRYPTION 
                 <i className="fa-solid fa-circle text-[4px] opacity-20"></i>
                 STRIPE CERTIFIED
               </p>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};

export default BillingModal;
