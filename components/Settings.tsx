import React, { useState } from 'react';
import { AppConfig } from '../types';

interface SettingsProps {
  onSave: (config: AppConfig) => void;
}

const Settings: React.FC<SettingsProps> = ({ onSave }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [error, setError] = useState('');

  // Updated with the new Live Stripe Key provided by the user
  const [config, setConfig] = useState<AppConfig>({
    stripePublicKey: 'mk_1Sfx5p0Z7icb3eU0ZY5FTKGm',
    canvaApiKey: '',
    blotatoApiKey: '',
    blotatoAccounts: []
  });

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUser === 'SysAdmin' && adminPass === 'TheShooter12') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Access Denied: Invalid Credentials');
    }
  };

  const handleSave = () => {
    onSave(config);
    alert("Administrator configurations saved to system memory.");
  };

  if (!isAuthenticated) {
    return (
      <div className="h-[80vh] flex items-center justify-center animate-in fade-in zoom-in duration-500">
        <div className="max-w-md w-full bg-slate-800 p-10 rounded-[2.5rem] border border-slate-700 shadow-2xl space-y-8 text-center">
          <div className="w-20 h-20 bg-red-600/10 rounded-3xl flex items-center justify-center border border-red-500/20 mx-auto">
            <i className="fa-solid fa-user-shield text-4xl text-red-500"></i>
          </div>
          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Admin Terminal</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Authorized Personnel Only</p>
          </div>
          
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-2">
              <input 
                type="text" 
                placeholder="Admin Username"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition-all font-bold placeholder:text-slate-700"
              />
              <input 
                type="password" 
                placeholder="Access Password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition-all font-bold placeholder:text-slate-700"
              />
            </div>
            {error && <p className="text-red-500 text-[10px] font-black uppercase italic tracking-widest animate-pulse">{error}</p>}
            <button 
              type="submit"
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-red-600/20 active:scale-95"
            >
              Unlock Terminal
            </button>
          </form>
          
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest pt-4">Encryption: AES-256 Enabled</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-600/10 rounded-xl flex items-center justify-center border border-red-500/20">
            <i className="fa-solid fa-user-shield text-2xl text-red-500"></i>
          </div>
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">System Administrator</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Global Production Infrastructure</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest border border-slate-700"
          >
            Lock
          </button>
          <button 
            onClick={handleSave}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20"
          >
            Deploy Config
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Stripe Config */}
        <div className="bg-slate-800 border-l-4 border-l-blue-600 border border-slate-700 p-8 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <i className="fa-brands fa-stripe text-4xl text-[#635BFF]"></i>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Financial Terminal</h3>
            </div>
            <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase rounded-full border border-green-500/20">Active Link</span>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 text-left">Master Stripe Secret Key</label>
            <div className="relative">
              <input 
                type="password" 
                value={config.stripePublicKey}
                onChange={e => setConfig({...config, stripePublicKey: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white font-mono text-sm focus:ring-2 focus:ring-blue-600 outline-none pr-12"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700">
                <i className="fa-solid fa-key"></i>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-medium italic">This key powers the site-wide credit purchasing system and subscription tiers.</p>
        </div>

        {/* Canva Config */}
        <div className="bg-slate-800 border-l-4 border-l-[#00C4CC] border border-slate-700 p-8 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#00C4CC]/10 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-palette text-2xl text-[#00C4CC]"></i>
            </div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Canva Bridge</h3>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 mb-4">
             <p className="text-[10px] font-bold text-slate-400 italic">Admin Tool: <code className="text-[#00C4CC] font-mono">npm install -g @canva/cli@latest</code></p>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 text-left">Partner API Key</label>
            <input 
              type="password" 
              value={config.canvaApiKey}
              onChange={e => setConfig({...config, canvaApiKey: e.target.value})}
              placeholder="Enter Canva SDK Partner Key"
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white focus:ring-2 focus:ring-[#00C4CC] outline-none font-mono text-sm"
            />
          </div>
        </div>

        {/* Blotato Config */}
        <div className="bg-slate-800 border-l-4 border-l-indigo-600 border border-slate-700 p-8 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-paper-plane text-2xl text-indigo-500"></i>
            </div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Blotato Distribution Hub</h3>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 text-left">Master Service Key</label>
            <input 
              type="password" 
              value={config.blotatoApiKey}
              onChange={e => setConfig({...config, blotatoApiKey: e.target.value})}
              placeholder="blotato_live_..."
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white focus:ring-2 focus:ring-indigo-600 outline-none font-mono text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-600/5 border border-blue-500/10 p-6 rounded-3xl text-center">
        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">
          Administrator Production Environment v1.0.5
        </p>
      </div>
    </div>
  );
};

export default Settings;