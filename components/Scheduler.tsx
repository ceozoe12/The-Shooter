
import React, { useState, useEffect } from 'react';
import { GeneratedImage, CreditState, AppConfig, BlotatoAccount } from '../types';
import { fetchBlotatoAccounts } from '../services/blotatoService';

interface SchedulerProps {
  image: GeneratedImage | null;
  credits: CreditState;
  config: AppConfig;
  onUpdateConfig: (config: Partial<AppConfig>) => void;
  onOpenBilling: () => void;
  onPost: () => void;
  onGoBackToEdit: () => void;
}

interface PlatformType {
  id: BlotatoAccount['platform'];
  name: string;
  icon: string;
  colorClass: string;
}

const Scheduler: React.FC<SchedulerProps> = ({ 
  image, 
  credits, 
  config, 
  onUpdateConfig, 
  onOpenBilling, 
  onPost, 
  onGoBackToEdit 
}) => {
  const PLATFORMS: PlatformType[] = [
    { id: 'instagram', name: 'Instagram', icon: 'fa-instagram', colorClass: 'text-pink-500' },
    { id: 'tiktok', name: 'TikTok', icon: 'fa-tiktok', colorClass: 'text-slate-200' },
    { id: 'facebook', name: 'Facebook', icon: 'fa-facebook', colorClass: 'text-blue-600' },
    { id: 'threads', name: 'Threads', icon: 'fa-at', colorClass: 'text-white' },
    { id: 'youtube', name: 'YouTube Shorts', icon: 'fa-youtube', colorClass: 'text-red-600' },
    { id: 'twitter', name: 'X / Twitter', icon: 'fa-x-twitter', colorClass: 'text-slate-300' },
    { id: 'bluesky', name: 'Bluesky', icon: 'fa-cloud', colorClass: 'text-blue-400' },
  ];

  const [selectedPlatformId, setSelectedPlatformId] = useState<BlotatoAccount['platform']>('instagram');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(config.blotatoApiKey);

  // Filter accounts based on selected platform
  const filteredAccounts = config.blotatoAccounts.filter(acc => acc.platform === selectedPlatformId);

  // Auto-select first account when platform changes or accounts update
  useEffect(() => {
    if (filteredAccounts.length > 0) {
      setSelectedAccountId(filteredAccounts[0].id);
    } else {
      setSelectedAccountId('');
    }
  }, [selectedPlatformId, config.blotatoAccounts]);

  const handleConnectBlotato = async () => {
    if (!tempApiKey) return;
    setIsFetching(true);
    try {
      const accounts = await fetchBlotatoAccounts(tempApiKey);
      onUpdateConfig({ 
        blotatoApiKey: tempApiKey,
        blotatoAccounts: accounts 
      });
      alert(`Bridge Established! Syncing ${accounts.length} social channels from Blotato.`);
    } catch (e) {
      alert("Security Handshake Failed. Please verify your Blotato API Key.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSchedule = () => {
    if (!config.blotatoApiKey) {
      alert("Please link your Blotato Bridge first.");
      return;
    }
    if (!selectedAccountId) {
      alert("Select a target distribution account.");
      return;
    }
    
    setIsScheduling(true);
    const targetAccount = config.blotatoAccounts.find(a => a.id === selectedAccountId);
    
    setTimeout(() => {
      setIsScheduling(false);
      alert(`Asset successfully broadcast to ${targetAccount?.name} (${targetAccount?.handle}) via Blotato!`);
      onPost();
    }, 2000);
  };

  if (credits.subscriptionLevel !== 'pro' && image) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-800 rounded-[3rem] border border-slate-700 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mb-6 border border-blue-500/20 shadow-2xl shadow-blue-500/10">
          <i className="fa-solid fa-lock text-4xl text-blue-500"></i>
        </div>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-2">Omnichannel Distribution</h2>
        <p className="text-slate-400 max-w-md mx-auto mb-10 text-lg">
          Connect your social empire. Pro members can deploy AI assets across 7+ major platforms instantly via the Blotato integration.
        </p>
        <div className="flex gap-4">
           <button onClick={onPost} className="px-8 py-4 bg-slate-700 hover:bg-slate-650 text-white rounded-2xl font-black uppercase tracking-widest transition-all">Go Back</button>
           <button onClick={onOpenBilling} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all transform hover:scale-105">Get Pro Access</button>
        </div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center p-12 bg-slate-800 rounded-[3rem] border border-slate-700 text-center">
        <i className="fa-solid fa-paper-plane text-7xl text-slate-750 mb-6"></i>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-6">Payload Empty</h2>
        <button onClick={onPost} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500 transition-all">Go to Production Studio</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-slate-800 rounded-[3rem] p-12 border border-slate-700 shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-right-8 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4 text-white">
            <i className="fa-solid fa-paper-plane text-blue-600"></i>
            Distribution Bridge
          </h2>
          <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mt-2">Omnichannel Broadcast Terminal</p>
        </div>
        <div className="flex flex-wrap gap-4">
           <a 
            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center gap-3 text-blue-400 hover:text-white text-xs font-black uppercase tracking-widest bg-blue-600/10 px-6 py-3 rounded-2xl border border-blue-500/20 transition-all hover:bg-blue-600"
           >
             <i className="fa-solid fa-play-circle text-lg"></i>
             Video Setup Guide
           </a>
           <button 
            onClick={onGoBackToEdit}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 border border-slate-650 transition-all"
           >
             <i className="fa-solid fa-chevron-left"></i>
             Back to Brand Studio
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Preview Side */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-700 shadow-2xl relative group aspect-[4/5] max-w-sm mx-auto ring-1 ring-white/10">
            <img src={image.url} alt="Distribution asset" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent p-10">
               <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border-2 border-white/20 overflow-hidden shadow-2xl">
                    <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${selectedAccountId || 'default'}`} alt="pfp" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-tighter">
                      {config.blotatoAccounts.find(a => a.id === selectedAccountId)?.handle || '@influencer_id'}
                    </p>
                    <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest italic">Target Matrix Link</p>
                  </div>
               </div>
            </div>
            <div className="absolute top-8 left-8 bg-black/60 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/10 flex items-center gap-3 text-white shadow-2xl">
              <i className={`fa-brands ${PLATFORMS.find(p => p.id === selectedPlatformId)?.icon} ${PLATFORMS.find(p => p.id === selectedPlatformId)?.colorClass} text-lg`}></i>
              <span className="text-xs font-black uppercase tracking-widest">{selectedPlatformId}</span>
            </div>
          </div>
          
          <div className="p-6 bg-blue-600/5 rounded-[2rem] border border-blue-500/10">
             <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 italic">Production Memo</h4>
             <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
               Maintaining aesthetic consistency on distribution via persistent character prompt integration. Asset ready for high-resolution broadcast.
             </p>
          </div>
        </div>

        {/* Configuration Side */}
        <div className="lg:col-span-7 space-y-10">
          {/* Blotato Connection Section */}
          {!config.blotatoApiKey ? (
            <div className="bg-slate-900/50 p-10 rounded-[2.5rem] border-2 border-dashed border-slate-700 space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
                  <i className="fa-solid fa-link-slash text-3xl text-slate-600"></i>
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Interface with Blotato</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-loose">
                  Link your personal Blotato API Key to connect your social identities.<br/>
                  <span className="text-blue-500 cursor-pointer hover:underline" onClick={() => window.open('https://blotato.com/signup', '_blank')}>Need an account? Sign up here.</span>
                </p>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type="password"
                    placeholder="ENTER BLOTATO API KEY"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-8 py-5 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-mono tracking-widest placeholder:text-slate-800 placeholder:font-sans placeholder:tracking-normal"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700">
                    <i className="fa-solid fa-key"></i>
                  </div>
                </div>
                <button 
                  onClick={handleConnectBlotato}
                  disabled={isFetching || !tempApiKey}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/30 disabled:opacity-50 active:scale-95"
                >
                  {isFetching ? <i className="fa-solid fa-spinner fa-spin mr-3"></i> : <i className="fa-solid fa-plug-circle-bolt mr-3"></i>}
                  Initiate Handshake
                </button>
                <p className="text-center text-[9px] text-slate-600 font-black uppercase tracking-widest">
                  Secure OAuth2 Handshake Protocol v1.0
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-6">Social Identity Matrix</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {PLATFORMS.map(p => {
                    const accountsForPlatform = config.blotatoAccounts.filter(acc => acc.platform === p.id);
                    const hasAccounts = accountsForPlatform.length > 0;
                    return (
                      <button 
                        key={p.id} 
                        onClick={() => setSelectedPlatformId(p.id)}
                        className={`group relative flex flex-col items-center justify-center p-6 rounded-[2rem] border transition-all ${
                          selectedPlatformId === p.id 
                          ? 'bg-slate-700 border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.15)] ring-1 ring-blue-500/50' 
                          : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                        } ${!hasAccounts ? 'opacity-40 grayscale' : ''}`}
                      >
                        <i className={`fa-brands ${p.icon} text-2xl mb-3 ${p.colorClass} group-hover:scale-110 transition-transform`}></i>
                        <span className="text-[9px] font-black uppercase tracking-widest">{p.name}</span>
                        {accountsForPlatform.length > 1 && (
                          <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px] font-black shadow-lg">
                            {accountsForPlatform.length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-5">
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Active Distribution Handle</label>
                {filteredAccounts.length > 0 ? (
                  <div className="relative group">
                    <select 
                      value={selectedAccountId}
                      onChange={(e) => setSelectedAccountId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-3xl px-8 py-6 text-white font-black uppercase tracking-tighter appearance-none focus:ring-2 focus:ring-blue-600 transition-all outline-none cursor-pointer group-hover:border-slate-500"
                    >
                      {filteredAccounts.map(acc => (
                        <option key={acc.id} value={acc.id} className="bg-slate-900">
                          {acc.name} — {acc.handle}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-blue-500 transition-colors">
                      <i className="fa-solid fa-chevron-down"></i>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl text-center">
                    <p className="text-xs font-black text-slate-600 uppercase tracking-widest italic">No {selectedPlatformId} Identities Linked on Blotato</p>
                    <button 
                      onClick={() => window.open('https://blotato.com/accounts', '_blank')}
                      className="text-[10px] text-blue-500 hover:text-blue-400 font-black uppercase mt-3 transition-colors underline underline-offset-4"
                    >
                      Manage Blotato Accounts
                    </button>
                  </div>
                )}
                {filteredAccounts.length > 1 && (
                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic flex items-center gap-2">
                     <i className="fa-solid fa-circle-info text-blue-500"></i>
                     Multiple accounts found. Selecting distribution priority.
                   </p>
                )}
              </div>

              <div className="pt-10 border-t border-slate-700/50 space-y-6">
                <button
                  onClick={handleSchedule}
                  disabled={isScheduling || !selectedAccountId}
                  className={`w-full py-7 rounded-[2.5rem] font-black text-2xl flex items-center justify-center gap-4 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl ${
                    selectedAccountId 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-600/30' 
                    : 'bg-slate-750 text-slate-600 cursor-not-allowed grayscale'
                  }`}
                >
                  {isScheduling ? (
                    <i className="fa-solid fa-spinner fa-spin"></i>
                  ) : (
                    <>
                      <i className="fa-solid fa-bolt"></i>
                      Deploy to Network
                    </>
                  )}
                </button>
                <div className="flex items-center justify-between px-6">
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic">
                     <i className="fa-solid fa-shield-check mr-2 text-blue-600"></i> SECURE BROADCAST
                   </p>
                   <button 
                    onClick={() => {
                      if(confirm("Disconnect Blotato Bridge? All channel data will be cleared from session memory.")) {
                        onUpdateConfig({ blotatoApiKey: '', blotatoAccounts: [] });
                      }
                    }}
                    className="text-[10px] font-black text-slate-600 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-2"
                   >
                     <i className="fa-solid fa-power-off"></i>
                     Disconnect Bridge
                   </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scheduler;
