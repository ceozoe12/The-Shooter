
import React, { useState } from 'react';
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

  const handleCheckout = () => {
    if (!selectedItem) return;
    setIsProcessing(true);
    // Simulate Stripe payment processing
    setTimeout(() => {
      if (selectedItem.type === 'sub') {
        setCredits(prev => ({ ...prev, subscriptionLevel: selectedItem.id as SubscriptionLevel }));
      } else {
        setCredits(prev => ({ ...prev, creditsRemaining: prev.creditsRemaining + selectedItem.amount }));
      }
      setIsProcessing(false);
      setSelectedItem(null);
      alert("Payment successful! Your account has been updated.");
    }, 2000);
  };

  const handleOpenGeminiKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setCredits(prev => ({ ...prev, apiKeySet: true }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
        {selectedItem ? (
          /* Checkout View (Stripe Mockup) */
          <div className="flex flex-col lg:flex-row h-full">
            <div className="lg:w-1/2 p-12 bg-slate-800/30">
               <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-white mb-8 flex items-center gap-2 font-bold text-sm">
                 <i className="fa-solid fa-arrow-left"></i> Back to Studio
               </button>
               <h3 className="text-slate-500 uppercase font-black tracking-widest text-xs mb-2">Order Summary</h3>
               <div className="flex justify-between items-end mb-8">
                  <h2 className="text-3xl font-bold text-white">
                    {selectedItem.type === 'sub' ? `${selectedItem.id.toUpperCase()} Membership` : `${selectedItem.amount} Credits`}
                  </h2>
                  <p className="text-2xl font-black text-white">${selectedItem.price.toFixed(2)}</p>
               </div>
               <div className="space-y-4">
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-400">Processing Fee</span>
                   <span className="text-white">$0.00</span>
                 </div>
                 <div className="h-px bg-slate-800"></div>
                 <div className="flex justify-between text-lg font-bold">
                   <span className="text-slate-400">Total Due</span>
                   <span className="text-white">${selectedItem.price.toFixed(2)}</span>
                 </div>
               </div>
            </div>
            <div className="lg:w-1/2 p-12 bg-white text-slate-950 flex flex-col justify-center">
               <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                 <i className="fa-brands fa-stripe text-3xl text-[#635BFF]"></i>
                 Secure Checkout
               </h3>
               <div className="space-y-4">
                 <div className="p-4 border border-slate-200 rounded-xl">
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Card Information</label>
                   <div className="flex items-center gap-2 text-slate-600 mb-2">
                     <i className="fa-solid fa-credit-card"></i>
                     <span className="text-sm font-medium flex-1">4242 4242 4242 4242</span>
                     <span className="text-sm font-medium">12 / 24</span>
                     <span className="text-sm font-medium">123</span>
                   </div>
                 </div>
                 <button 
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#635BFF] text-white rounded-xl font-bold text-lg hover:brightness-110 transition-all flex items-center justify-center gap-3"
                 >
                   {isProcessing ? <i className="fa-solid fa-spinner fa-spin"></i> : `Pay $${selectedItem.price.toFixed(2)}`}
                 </button>
                 <p className="text-[10px] text-slate-400 text-center italic">
                   Payments secured by Stripe.
                 </p>
               </div>
            </div>
          </div>
        ) : (
          /* Plan Selection View */
          <>
          <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Studio Access & Billing</h2>
              <p className="text-slate-400 text-sm mt-1">Join The Shooter production fleet</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
              <i className="fa-solid fa-xmark text-xl text-slate-400"></i>
            </button>
          </div>

          <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Plan */}
                <div className={`p-6 rounded-2xl border-2 transition-all flex flex-col ${credits.subscriptionLevel === 'basic' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-800/40 hover:border-slate-700'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">Basic</h3>
                      <p className="text-[10px] text-slate-500 uppercase font-black">Production</p>
                    </div>
                    <span className="text-xl font-bold text-white">${BASIC_SUB_FEE}<span className="text-[10px] text-slate-500">/mo</span></span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-400 mb-8 flex-1">
                    <li className="flex items-center gap-2"><i className="fa-solid fa-check text-blue-500"></i> Character Consistency</li>
                    <li className="flex items-center gap-2"><i className="fa-solid fa-check text-blue-500"></i> Batch Sequences</li>
                  </ul>
                  <button 
                    onClick={() => setSelectedItem({ type: 'sub', id: 'basic', amount: 0, price: BASIC_SUB_FEE })}
                    disabled={credits.subscriptionLevel === 'basic' || credits.subscriptionLevel === 'pro'}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                      credits.subscriptionLevel === 'basic' ? 'bg-blue-600 text-white cursor-default' : 
                      credits.subscriptionLevel === 'pro' ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >
                    {credits.subscriptionLevel === 'basic' ? 'Active Plan' : credits.subscriptionLevel === 'pro' ? 'Included in Pro' : 'Choose Basic'}
                  </button>
                </div>

                {/* Pro Plan */}
                <div className={`p-6 rounded-2xl border-2 transition-all flex flex-col relative overflow-hidden ${credits.subscriptionLevel === 'pro' ? 'border-blue-400 bg-blue-400/10' : 'border-slate-800 bg-slate-800/40 hover:border-slate-700'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">Pro</h3>
                      <p className="text-[10px] text-blue-400 uppercase font-black">Full Suite</p>
                    </div>
                    <span className="text-xl font-bold text-white">${PRO_SUB_FEE}<span className="text-[10px] text-slate-500">/mo</span></span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300 mb-8 flex-1">
                    <li className="flex items-center gap-2"><i className="fa-solid fa-check text-blue-400"></i> Brand Studio</li>
                    <li className="flex items-center gap-2"><i className="fa-solid fa-check text-blue-400"></i> Social Distribution</li>
                  </ul>
                  <button 
                    onClick={() => setSelectedItem({ type: 'sub', id: 'pro', amount: 0, price: PRO_SUB_FEE })}
                    disabled={credits.subscriptionLevel === 'pro'}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                      credits.subscriptionLevel === 'pro' ? 'bg-blue-600 text-white cursor-default' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white'
                    }`}
                  >
                    {credits.subscriptionLevel === 'pro' ? 'Active Plan' : 'Go Pro'}
                  </button>
                </div>
              </div>

              <div className="bg-slate-950/50 rounded-2xl p-6 border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm flex items-center gap-2 text-white">
                    <i className="fa-solid fa-key text-yellow-500"></i>
                    Gemini API Access
                  </h4>
                  {credits.apiKeySet && <span className="text-[10px] font-black text-green-500 uppercase">Connected</span>}
                </div>
                <button 
                  onClick={handleOpenGeminiKey}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 flex items-center justify-center gap-2 border border-slate-700 transition-all"
                >
                  <i className="fa-solid fa-link"></i>
                  {credits.apiKeySet ? 'Update API Key' : 'Connect Personal API Key'}
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-coins text-yellow-500"></i>
                Purchase Credits
              </h3>
              
              <div className="grid grid-cols-1 gap-2">
                {CREDIT_BLOCKS.map(block => (
                  <button
                    key={block.amount}
                    onClick={() => setSelectedItem({ type: 'pack', id: block.label, amount: block.amount, price: block.price })}
                    disabled={credits.subscriptionLevel === 'none'}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      credits.subscriptionLevel === 'none' ? 'bg-slate-900 border-slate-800 opacity-50 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-750 border-slate-700 hover:border-slate-600 hover:scale-[1.01]'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-bold text-sm text-white">{block.amount} Credits</p>
                      <p className="text-[10px] text-slate-500">{block.label}</p>
                    </div>
                    <span className="font-black text-blue-400 text-sm">${block.price.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BillingModal;
